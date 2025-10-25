import type { Express } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { storage } from "../storage";
import { db } from "../db";

export function registerMiscRoutes(app: Express) {
  // Create uploads directory if it doesn't exist
  try {
    mkdirSync('uploads/videos', { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  // Configure multer for video uploads
  const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const uploadVideo = multer({
    storage: videoStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /webm|mp4|mov|avi/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Only video files are allowed!'));
      }
    }
  });

  // File upload endpoint for video messages
  app.post("/api/upload-video", uploadVideo.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // Return the URL where the video can be accessed
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res.json({ videoUrl });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });

  // Serve uploaded videos
  app.use('/uploads', express.static('uploads'));

  // TEST ONLY: Clean up broken holdings with temp investment IDs
  app.post("/api/test/cleanup-broken-holdings/:childId", async (req, res) => {
    try {
      const { childId } = req.params;
      const { portfolioHoldings } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const holdings = await storage.getPortfolioHoldingsByChild(childId);

      const brokenHoldings = [];
      for (const holding of holdings) {
        const investment = await storage.getInvestment(holding.investmentId);
        if (!investment) {
          brokenHoldings.push(holding);
          console.log(`[Cleanup] Deleting broken holding ${holding.id} with invalid investmentId: ${holding.investmentId}`);
          // Delete the broken holding using db directly
          await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, holding.id));
        }
      }

      res.json({
        message: `Cleaned up ${brokenHoldings.length} broken holdings`,
        deleted: brokenHoldings.map(h => ({ id: h.id, investmentId: h.investmentId }))
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ error: "Failed to cleanup holdings" });
    }
  });

  // TEST ONLY: List all contributors
  app.get("/api/test/contributors", async (req, res) => {
    try {
      const { contributors } = await import("@shared/schema");
      const allContributors = await db.select().from(contributors);
      res.json({
        count: allContributors.length,
        contributors: allContributors.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          isRegistered: c.isRegistered,
          createdAt: c.createdAt,
        }))
      });
    } catch (error) {
      console.error("Failed to list contributors:", error);
      res.status(500).json({ error: "Failed to list contributors" });
    }
  });

  // TEST ONLY: Create a test contributor
  app.post("/api/test/create-contributor", async (req, res) => {
    try {
      const testEmail = "test@contributor.com";
      const existingContributor = await storage.getContributorByEmail(testEmail);

      if (existingContributor) {
        return res.json({
          message: "Test contributor already exists",
          email: testEmail,
          contributor: existingContributor
        });
      }

      const contributor = await storage.createContributor({
        email: testEmail,
        name: "Test Contributor",
        password: null,
        phone: null,
        profileImageUrl: null,
        isRegistered: false,
      });

      res.json({
        message: "Test contributor created",
        email: testEmail,
        contributor
      });
    } catch (error) {
      console.error("Failed to create test contributor:", error);
      res.status(500).json({ error: "Failed to create test contributor" });
    }
  });
}
