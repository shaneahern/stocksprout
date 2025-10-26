import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { insertChildSchema } from "@shared/schema";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { handleError, handleNotFound, handleForbidden, handleValidationError } from "../utils/error-handler";

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
          firstName: children.firstName,
          lastName: children.lastName,
          birthdate: children.birthdate,
          profileImageUrl: children.profileImageUrl,
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
      return handleError(res, error, "Failed to fetch children");
    }
  });

  app.get("/api/children/by-id/:childId", async (req, res) => {
    try {
      const child = await storage.getChild(req.params.childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      res.json(child);
    } catch (error) {
      return handleError(res, error, "Failed to fetch child");
    }
  });

  app.post("/api/children", async (req, res) => {
    try {
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error) {
      return handleValidationError(res, error, "Invalid child data");
    }
  });

  // Update child profile photo
  app.patch("/api/children/:childId/profile-photo", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { childId } = req.params;
      const { profileImageUrl } = req.body;

      // Verify the child belongs to the authenticated user
      const child = await storage.getChild(childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }

      if (child.parentId !== userId) {
        return handleForbidden(res, "You can only update profile photos for your own children");
      }

      // Update the child's profile photo
      const updatedChild = await storage.updateChild(childId, { profileImageUrl });
      res.json(updatedChild);
    } catch (error) {
      return handleError(res, error, "Failed to update child profile photo");
    }
  });

  app.get("/api/children/by-gift-code/:giftCode", async (req, res) => {
    try {
      const child = await storage.getChildByGiftCode(req.params.giftCode);
      if (!child) {
        return handleNotFound(res, "Child");
      }
      res.json(child);
    } catch (error) {
      return handleError(res, error, "Failed to fetch child");
    }
  });

  // Mock SMS link generation
  app.post("/api/generate-gift-link", async (req, res) => {
    try {
      const { childId } = req.body;
      const child = await storage.getChild(childId);
      if (!child) {
        return handleNotFound(res, "Child");
      }

      const baseUrl = process.env.REPLIT_DOMAINS ?
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` :
        'http://localhost:3000';

      const giftLink = `${baseUrl}/gift/${child.giftLinkCode}`;
      const childName = `${child.firstName} ${child.lastName}`;

      res.json({
        giftLink,
        giftCode: child.giftLinkCode,
        childName
      });
    } catch (error) {
      return handleError(res, error, "Failed to generate gift link");
    }
  });
}
