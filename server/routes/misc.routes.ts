import type { Express } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { storage } from "../storage";
import { db } from "../db";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { or } from "drizzle-orm";
import { uploadVideoToCloudinary, isCloudinaryUrl } from "../cloudinary";

export function registerMiscRoutes(app: Express) {
  // Check if Cloudinary is configured
  const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  // Create uploads directory for fallback local storage (if Cloudinary not configured)
  if (!isCloudinaryConfigured) {
    try {
      mkdirSync('uploads/videos', { recursive: true });
      console.warn('[Video Upload] Cloudinary not configured. Using local file storage (files may be lost on Replit restarts).');
    } catch (err) {
      // Directory might already exist
    }
  }

  // Configure multer for video uploads
  // Use memory storage when Cloudinary is configured (upload directly to cloud)
  // Use disk storage as fallback when Cloudinary is not configured
  const videoStorage = isCloudinaryConfigured
    ? multer.memoryStorage()
    : multer.diskStorage({
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
      const allowedExtensions = /\.(webm|mp4|mov|avi|m4v)$/i;
      const allowedMimeTypes = /video\/(webm|mp4|quicktime|x-msvideo|mp4v-es|m4v)/i;
      
      const ext = path.extname(file.originalname).toLowerCase();
      const extname = allowedExtensions.test(ext);
      const mimetype = allowedMimeTypes.test(file.mimetype);
      
      // Accept if either extension OR mime type is valid (more lenient for mobile videos)
      if (extname || mimetype) {
        return cb(null, true);
      } else {
        console.error('Invalid video file:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          ext: ext
        });
        cb(new Error(`Only video files are allowed! Received: ${file.mimetype || 'unknown type'}, extension: ${ext || 'none'}`));
      }
    }
  });

  // File upload endpoint for video messages
  app.post("/api/upload-video", uploadVideo.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      let videoUrl: string;

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        try {
          const result = await uploadVideoToCloudinary(req.file, req.file.originalname);
          videoUrl = result.secure_url; // Use secure HTTPS URL
          console.log(`[Video Upload] Successfully uploaded to Cloudinary: ${result.public_id}`);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          // Fallback to local storage if Cloudinary upload fails
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = 'video-' + uniqueSuffix + path.extname(req.file.originalname);
          const fs = await import('fs/promises');
          await fs.writeFile(`uploads/videos/${filename}`, req.file.buffer);
          videoUrl = `/uploads/videos/${filename}`;
          console.warn(`[Video Upload] Cloudinary upload failed, saved locally: ${videoUrl}`);
        }
      } else {
        // Fallback to local storage
        videoUrl = `/uploads/videos/${req.file.filename}`;
      }

      res.json({ videoUrl });
    } catch (error) {
      console.error("Video upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload video";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Serve uploaded videos
  app.use('/uploads', express.static('uploads'));

  // Notifications endpoints
  app.get("/api/notifications", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      
      // Get all notifications for this user (as parent/user or as contributor)
      const userNotifications = await storage.getNotificationsByUser(userId);
      const contributorNotifications = await storage.getNotificationsByContributor(userId);
      
      // Combine and sort by date
      const allNotifications = [...userNotifications, ...contributorNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

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
