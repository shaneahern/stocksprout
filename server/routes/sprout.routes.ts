import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { createSproutRequestSchema, createRecurringContributionSchema } from "@shared/schema";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { handleError, handleNotFound, handleValidationError } from "../utils/error-handler";

export function registerSproutRoutes(app: Express) {
  // Sprout Request routes
  app.post("/api/sprout-requests", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const validatedData = createSproutRequestSchema.parse(req.body);

      // Create sprout request
      const sproutRequest = await storage.createSproutRequest({
        ...validatedData,
        parentId: userId,
        status: "pending",
      });

      // Generate the sprout request link
      const baseUrl = process.env.REPLIT_DOMAINS ?
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` :
        'http://localhost:3000';

      const sproutLink = `${baseUrl}/sprout/${sproutRequest.requestCode}`;

      // In a real implementation, send SMS here
      console.log(`Sprout request SMS would be sent to ${validatedData.contributorPhone}:`);
      console.log(`Hi ${validatedData.contributorName}! You've been invited to contribute to a child's investment account. Click here: ${sproutLink}`);

      res.json({
        sproutRequest,
        sproutLink,
        message: "Sprout request created successfully"
      });
    } catch (error) {
      return handleValidationError(res, error, "Failed to create sprout request");
    }
  });

  app.get("/api/sprout-requests/parent/:parentId", async (req, res) => {
    try {
      const requests = await storage.getSproutRequestsByParent(req.params.parentId);
      res.json(requests);
    } catch (error) {
      return handleError(res, error, "Failed to fetch sprout requests");
    }
  });

  app.get("/api/sprout-requests/code/:code", async (req, res) => {
    try {
      const request = await storage.getSproutRequestByCode(req.params.code);
      if (!request) {
        return res.status(404).json({ error: "Sprout request not found" });
      }

      // Get child information
      const child = await storage.getChild(request.childId);

      res.json({
        ...request,
        child
      });
    } catch (error) {
      console.error("Failed to fetch sprout request:", error);
      res.status(500).json({ error: "Failed to fetch sprout request" });
    }
  });

  app.patch("/api/sprout-requests/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateSproutRequestStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update sprout request:", error);
      res.status(500).json({ error: "Failed to update sprout request" });
    }
  });

  // Recurring Contribution routes
  app.post("/api/recurring-contributions", async (req, res) => {
    try {
      const validatedData = createRecurringContributionSchema.parse(req.body);

      // Calculate next contribution date based on frequency
      const now = new Date();
      const nextDate = new Date(now);
      if (validatedData.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      const contribution = await storage.createRecurringContribution({
        ...validatedData,
        amount: validatedData.amount.toString(),
        contributorId: null,
        nextContributionDate: nextDate,
        isActive: true,
      });

      res.status(201).json({
        contribution,
        message: `Recurring ${validatedData.frequency} contribution set up successfully`
      });
    } catch (error) {
      console.error("Recurring contribution error:", error);
      res.status(400).json({ error: "Failed to create recurring contribution" });
    }
  });

  app.get("/api/recurring-contributions/child/:childId", async (req, res) => {
    try {
      // Fixed N+1 query: Use SQL join to get contributions with investment data
      const { recurringContributions, investments } = await import("@shared/schema");
      const { desc, eq } = await import("drizzle-orm");

      const results = await db
        .select({
          // Contribution fields
          id: recurringContributions.id,
          childId: recurringContributions.childId,
          contributorId: recurringContributions.contributorId,
          contributorEmail: recurringContributions.contributorEmail,
          contributorName: recurringContributions.contributorName,
          investmentId: recurringContributions.investmentId,
          amount: recurringContributions.amount,
          frequency: recurringContributions.frequency,
          isActive: recurringContributions.isActive,
          nextContributionDate: recurringContributions.nextContributionDate,
          lastContributionDate: recurringContributions.lastContributionDate,
          createdAt: recurringContributions.createdAt,
          // Investment fields
          investmentSymbol: investments.symbol,
          investmentName: investments.name,
          investmentType: investments.type,
          investmentCurrentPrice: investments.currentPrice,
          investmentYtdReturn: investments.ytdReturn,
        })
        .from(recurringContributions)
        .leftJoin(investments, eq(recurringContributions.investmentId, investments.id))
        .where(eq(recurringContributions.childId, req.params.childId))
        .orderBy(desc(recurringContributions.createdAt));

      const enrichedContributions = results.map(row => ({
        id: row.id,
        childId: row.childId,
        contributorId: row.contributorId,
        contributorEmail: row.contributorEmail,
        contributorName: row.contributorName,
        investmentId: row.investmentId,
        amount: row.amount,
        frequency: row.frequency,
        isActive: row.isActive,
        nextContributionDate: row.nextContributionDate,
        lastContributionDate: row.lastContributionDate,
        createdAt: row.createdAt,
        investment: row.investmentSymbol ? {
          id: row.investmentId,
          symbol: row.investmentSymbol,
          name: row.investmentName,
          type: row.investmentType,
          currentPrice: row.investmentCurrentPrice,
          ytdReturn: row.investmentYtdReturn,
        } : null,
      }));

      res.json(enrichedContributions);
    } catch (error) {
      console.error("Failed to fetch recurring contributions:", error);
      res.status(500).json({ error: "Failed to fetch recurring contributions" });
    }
  });

  app.patch("/api/recurring-contributions/:id/cancel", async (req, res) => {
    try {
      await storage.cancelRecurringContribution(req.params.id);
      res.json({ success: true, message: "Recurring contribution cancelled" });
    } catch (error) {
      console.error("Failed to cancel recurring contribution:", error);
      res.status(500).json({ error: "Failed to cancel recurring contribution" });
    }
  });
}
