import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { insertChildSchema } from "@shared/schema";
import jwt from "jsonwebtoken";

export function registerChildrenRoutes(app: Express) {
  // Children routes
  app.get("/api/children/:parentId", async (req, res) => {
    try {
      // Fixed N+1 query: Use SQL join to get children with portfolio totals in a single query
      const { children, portfolioHoldings } = await import("@shared/schema");
      const { sql, eq } = await import("drizzle-orm");

      const results = await db
        .select({
          id: children.id,
          parentId: children.parentId,
          name: children.name,
          age: children.age,
          profileImageUrl: children.profileImageUrl,
          birthday: children.birthday,
          giftLinkCode: children.giftLinkCode,
          totalValue: sql<string>`COALESCE(SUM(${portfolioHoldings.currentValue}), 0)`,
          totalCost: sql<string>`COALESCE(SUM(${portfolioHoldings.shares} * ${portfolioHoldings.averageCost}), 0)`,
        })
        .from(children)
        .leftJoin(portfolioHoldings, eq(children.id, portfolioHoldings.childId))
        .where(eq(children.parentId, req.params.parentId))
        .groupBy(children.id);

      // Calculate totalGain from the aggregated values
      const enrichedChildren = results.map(child => ({
        ...child,
        totalValue: parseFloat(child.totalValue),
        totalCost: parseFloat(child.totalCost),
        totalGain: parseFloat(child.totalValue) - parseFloat(child.totalCost),
      }));

      res.json(enrichedChildren);
    } catch (error) {
      console.error("Failed to fetch children:", error);
      res.status(500).json({ error: "Failed to fetch children" });
    }
  });

  app.get("/api/children/by-id/:childId", async (req, res) => {
    try {
      const child = await storage.getChild(req.params.childId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      console.error("Failed to fetch child:", error);
      res.status(500).json({ error: "Failed to fetch child" });
    }
  });

  app.post("/api/children", async (req, res) => {
    try {
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error) {
      console.error("Failed to create child:", error);
      res.status(400).json({ error: "Invalid child data" });
    }
  });

  // Update child profile photo
  app.patch("/api/children/:childId/profile-photo", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      const userId = decoded.userId;

      const { childId } = req.params;
      const { profileImageUrl } = req.body;

      // Verify the child belongs to the authenticated user
      const child = await storage.getChild(childId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      if (child.parentId !== userId) {
        return res.status(403).json({ error: "You can only update profile photos for your own children" });
      }

      // Update the child's profile photo
      const updatedChild = await storage.updateChild(childId, { profileImageUrl });
      res.json(updatedChild);
    } catch (error) {
      console.error("Error updating child profile photo:", error);
      res.status(500).json({ error: "Failed to update child profile photo" });
    }
  });

  app.get("/api/children/by-gift-code/:giftCode", async (req, res) => {
    try {
      const child = await storage.getChildByGiftCode(req.params.giftCode);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      console.error("Failed to fetch child by gift code:", error);
      res.status(500).json({ error: "Failed to fetch child" });
    }
  });

  // Mock SMS link generation
  app.post("/api/generate-gift-link", async (req, res) => {
    try {
      const { childId } = req.body;
      const child = await storage.getChild(childId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      const baseUrl = process.env.REPLIT_DOMAINS ?
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` :
        'http://localhost:3000';

      const giftLink = `${baseUrl}/gift/${child.giftLinkCode}`;

      res.json({
        giftLink,
        giftCode: child.giftLinkCode,
        childName: child.name
      });
    } catch (error) {
      console.error("Failed to generate gift link:", error);
      res.status(500).json({ error: "Failed to generate gift link" });
    }
  });
}
