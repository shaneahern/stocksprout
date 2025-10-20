import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { insertGiftSchema, insertThankYouMessageSchema } from "@shared/schema";
import { stockAPI } from "../stock-api";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { handleError, handleNotFound, handleForbidden, handleValidationError } from "../utils/error-handler";

export function registerGiftRoutes(app: Express) {
  // Helper function to enrich gifts with joins (fixes N+1 query)
  async function getEnrichedGifts(childId: string, limit?: number) {
    const { gifts, investments, contributors, users } = await import("@shared/schema");
    const { desc, eq } = await import("drizzle-orm");

    let query = db
      .select({
        // Gift fields
        id: gifts.id,
        childId: gifts.childId,
        contributorId: gifts.contributorId,
        giftGiverName: gifts.giftGiverName,
        giftGiverEmail: gifts.giftGiverEmail,
        giftGiverProfileImageUrl: gifts.giftGiverProfileImageUrl,
        investmentId: gifts.investmentId,
        amount: gifts.amount,
        shares: gifts.shares,
        message: gifts.message,
        videoMessageUrl: gifts.videoMessageUrl,
        createdAt: gifts.createdAt,
        isViewed: gifts.isViewed,
        thankYouSent: gifts.thankYouSent,
        status: gifts.status,
        reviewedAt: gifts.reviewedAt,
        // Investment fields
        investmentSymbol: investments.symbol,
        investmentName: investments.name,
        investmentType: investments.type,
        investmentCurrentPrice: investments.currentPrice,
        investmentYtdReturn: investments.ytdReturn,
        // Contributor fields
        contributorName: contributors.name,
        contributorEmail: contributors.email,
        contributorProfileImageUrl: contributors.profileImageUrl,
        contributorIsRegistered: contributors.isRegistered,
        contributorCreatedAt: contributors.createdAt,
        // User fields (for parent purchases)
        userName: users.name,
        userEmail: users.email,
        userProfileImageUrl: users.profileImageUrl,
      })
      .from(gifts)
      .leftJoin(investments, eq(gifts.investmentId, investments.id))
      .leftJoin(contributors, eq(gifts.contributorId, contributors.id))
      .leftJoin(users, eq(gifts.contributorId, users.id))
      .where(eq(gifts.childId, childId))
      .orderBy(desc(gifts.createdAt));

    if (limit) {
      query = query.limit(limit) as any;
    }

    const results = await query;

    // Transform results to match expected format
    return results.map(row => ({
      id: row.id,
      childId: row.childId,
      contributorId: row.contributorId,
      giftGiverName: row.giftGiverName,
      giftGiverEmail: row.giftGiverEmail,
      giftGiverProfileImageUrl: row.giftGiverProfileImageUrl,
      investmentId: row.investmentId,
      amount: row.amount,
      shares: row.shares,
      message: row.message,
      videoMessageUrl: row.videoMessageUrl,
      createdAt: row.createdAt,
      isViewed: row.isViewed,
      thankYouSent: row.thankYouSent,
      status: row.status,
      reviewedAt: row.reviewedAt,
      investment: row.investmentSymbol ? {
        id: row.investmentId,
        symbol: row.investmentSymbol,
        name: row.investmentName,
        type: row.investmentType,
        currentPrice: row.investmentCurrentPrice,
        ytdReturn: row.investmentYtdReturn,
      } : null,
      contributor: row.contributorName ? {
        id: row.contributorId,
        name: row.contributorName,
        email: row.contributorEmail,
        profileImageUrl: row.contributorProfileImageUrl,
        phone: null,
        password: null,
        isRegistered: row.contributorIsRegistered,
        createdAt: row.contributorCreatedAt,
      } : row.userName ? {
        // Parent purchase - user instead of contributor
        id: row.contributorId,
        name: row.userName,
        email: row.userEmail,
        profileImageUrl: row.userProfileImageUrl,
        phone: null,
        password: null,
        isRegistered: true,
        createdAt: new Date(),
      } : null,
    }));
  }

  // Gift routes
  app.get("/api/gifts/:childId", async (req, res) => {
    try {
      const enrichedGifts = await getEnrichedGifts(req.params.childId);
      res.json(enrichedGifts);
    } catch (error) {
      console.error("Failed to fetch gifts:", error);
      res.status(500).json({ error: "Failed to fetch gifts" });
    }
  });

  app.get("/api/gifts/recent/:childId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const enrichedGifts = await getEnrichedGifts(req.params.childId, limit);
      res.json(enrichedGifts);
    } catch (error) {
      console.error("Failed to fetch recent gifts:", error);
      res.status(500).json({ error: "Failed to fetch recent gifts" });
    }
  });

  app.post("/api/gifts", async (req, res) => {
    try {
      const validatedData = insertGiftSchema.parse(req.body);

      // Handle temporary investment IDs from search results
      let investmentId = validatedData.investmentId;
      let investment = await storage.getInvestment(investmentId);

      // If investment doesn't exist (temp ID from search), create it
      if (!investment && investmentId.startsWith('temp-')) {
        const symbol = investmentId.replace('temp-', '');

        // Get real-time data from Finnhub
        const quote = await stockAPI.getQuote(symbol);
        const profile = await stockAPI.getCompanyProfile(symbol);

        if (!quote || !profile) {
          return res.status(404).json({ error: "Could not fetch investment data" });
        }

        // Determine investment type
        let investmentType = 'stock';
        if (symbol.match(/^(SPY|VOO|VTI|QQQ|IWM|EEM|VIG|AGG|BND|GLD|SLV|XL[A-Z])/)) {
          investmentType = 'etf';
        } else if (symbol.match(/^(BTC|ETH|DOGE|SOL|ADA)/)) {
          investmentType = 'crypto';
        }

        // Create the investment in our database
        investment = await storage.createInvestment({
          symbol: symbol,
          name: profile.name,
          type: investmentType,
          currentPrice: quote.currentPrice.toFixed(2),
          ytdReturn: quote.changePercent.toFixed(2),
        });

        investmentId = investment.id;
      }

      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }

      const shares = parseFloat(validatedData.amount) / parseFloat(investment.currentPrice);
      const giftData = { ...validatedData, investmentId, shares: shares.toFixed(6) };

      // Check if this is a parent purchasing for their own child
      const child = await storage.getChild(validatedData.childId);
      const isParentPurchase = child && validatedData.contributorId && child.parentId === validatedData.contributorId;

      const gift = await storage.createGift(giftData);

      // Auto-approve parent purchases (skip custodian review)
      if (isParentPurchase) {
        await storage.approveGift(gift.id);

        // Update portfolio holdings for auto-approved gifts
        const existingHolding = await storage.getPortfolioHoldingByInvestment(
          validatedData.childId,
          investmentId  // Use the updated investmentId, not validatedData.investmentId
        );

        if (existingHolding) {
          const newShares = parseFloat(existingHolding.shares) + shares;
          const newValue = newShares * parseFloat(investment.currentPrice);
          const totalCost = (parseFloat(existingHolding.shares) * parseFloat(existingHolding.averageCost)) +
                           parseFloat(validatedData.amount);
          const newAverageCost = totalCost / newShares;

          await storage.updatePortfolioHolding(existingHolding.id, {
            shares: newShares.toFixed(6),
            averageCost: newAverageCost.toFixed(2),
            currentValue: newValue.toFixed(2),
          });
        } else {
          await storage.createPortfolioHolding({
            childId: validatedData.childId,
            investmentId: investmentId,  // Use the updated investmentId, not validatedData.investmentId
            shares: shares.toFixed(6),
            averageCost: investment.currentPrice,
            currentValue: validatedData.amount,
          });
        }
      }
      // External gifts remain in "pending" status until custodian approves them

      res.json(gift);
    } catch (error) {
      console.error("Gift creation error:", error);
      res.status(400).json({ error: "Invalid gift data" });
    }
  });

  app.patch("/api/gifts/:id/viewed", async (req, res) => {
    try {
      await storage.markGiftAsViewed(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark gift as viewed:", error);
      res.status(500).json({ error: "Failed to mark gift as viewed" });
    }
  });

  app.patch("/api/gifts/:id/approve", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const gift = await storage.getGift(req.params.id);

      if (!gift) {
        return handleNotFound(res, "Gift");
      }

      // Verify the user is the parent of the child
      const child = await storage.getChild(gift.childId);

      if (!child || child.parentId !== userId) {
        return handleForbidden(res, "You can only approve gifts for your own children");
      }

      // Approve the gift first
      await storage.approveGift(req.params.id);

      // Get investment details
      const investment = await storage.getInvestment(gift.investmentId);
      if (!investment) {
        return handleNotFound(res, "Investment");
      }

      // Update or create portfolio holding
      const existingHoldings = await storage.getPortfolioHoldingsByChild(gift.childId);
      const existingHolding = existingHoldings.find(h => h.investmentId === gift.investmentId);

      const giftShares = parseFloat(gift.shares);
      const giftAmount = parseFloat(gift.amount);

      if (existingHolding) {
        const newShares = parseFloat(existingHolding.shares) + giftShares;
        const newTotalCost = parseFloat(existingHolding.averageCost) * parseFloat(existingHolding.shares) + giftAmount;
        const newAverageCost = newTotalCost / newShares;
        const newCurrentValue = newShares * parseFloat(investment.currentPrice);

        await storage.updatePortfolioHolding(existingHolding.id, {
          shares: newShares.toFixed(6),
          averageCost: newAverageCost.toFixed(2),
          currentValue: newCurrentValue.toFixed(2)
        });
      } else {
        await storage.createPortfolioHolding({
          childId: gift.childId,
          investmentId: gift.investmentId,
          shares: gift.shares,
          averageCost: investment.currentPrice,
          currentValue: gift.amount
        });
      }

      res.json({ success: true, message: "Gift approved and added to portfolio" });
    } catch (error) {
      return handleError(res, error, "Failed to approve gift");
    }
  });

  app.patch("/api/gifts/:id/reject", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const gift = await storage.getGift(req.params.id);

      if (!gift) {
        return handleNotFound(res, "Gift");
      }

      // Verify the user is the parent of the child
      const child = await storage.getChild(gift.childId);
      if (!child || child.parentId !== userId) {
        return handleForbidden(res, "You can only reject gifts for your own children");
      }

      // Reject the gift
      await storage.rejectGift(req.params.id);

      res.json({ success: true, message: "Gift rejected" });
    } catch (error) {
      return handleError(res, error, "Failed to reject gift");
    }
  });

  // Thank you message routes
  app.post("/api/thank-you", async (req, res) => {
    try {
      const validatedData = insertThankYouMessageSchema.parse(req.body);
      const message = await storage.createThankYouMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Failed to create thank you message:", error);
      res.status(400).json({ error: "Invalid thank you message data" });
    }
  });

  app.get("/api/thank-you/:giftId", async (req, res) => {
    try {
      const messages = await storage.getThankYouMessagesByGift(req.params.giftId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch thank you messages:", error);
      res.status(500).json({ error: "Failed to fetch thank you messages" });
    }
  });
}
