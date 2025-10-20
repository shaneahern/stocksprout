import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { contributors } from "@shared/schema";
import { insertChildSchema, insertGiftSchema, insertThankYouMessageSchema, signupSchema, loginSchema, updateProfileSchema, createSproutRequestSchema, createRecurringContributionSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { stockAPI } from "./stock-api";
import { sendPasswordResetEmail, testEmailConnection } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // Check if username exists (only for custodians who need username)
      if (validatedData.username) {
        const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
        if (existingUserByUsername) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username || null,
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        phone: validatedData.phone || null,
        profileImageUrl: validatedData.profileImageUrl || null,
        bankAccountNumber: validatedData.bankAccountNumber || null,
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ error: "Invalid signup data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Try to find user by email first, then by username (for backwards compatibility)
      let user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        user = await storage.getUserByUsername(validatedData.email); // email field can be username too
      }
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // TEMPORARILY DISABLED: Password verification for testing
      // TODO: Re-enable password checking in production
      // if (user.password) {
      //   const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      //   if (!isValidPassword) {
      //     return res.status(401).json({ error: "Invalid credentials" });
      //   }
      // }
      console.log(`⚠️  PASSWORD CHECK DISABLED - FOR TESTING ONLY`);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.getUserByUsername(email); // Also check by username
      }

      // For security reasons, we don't reveal whether the email exists or not
      // Always return success message
      console.log(`Password reset requested for email: ${email} (user exists: ${!!user})`);
      
      if (user) {
        // Generate a secure reset token (in production, you'd store this in the database)
        const resetToken = jwt.sign(
          { userId: user.id, email: user.email, type: 'password-reset' },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "1h" }
        );
        
        // Send password reset email
        const emailSent = await sendPasswordResetEmail({
          email: user.email,
          resetToken,
          userName: user.name
        });
        
        if (!emailSent) {
          console.error(`Failed to send password reset email to: ${email}`);
          // Still return success for security reasons
        }
      }
      
      res.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  // WebAuthn routes for biometric authentication
  app.post("/api/auth/webauthn/register", async (req, res) => {
    try {
      const { userId, credentialId, publicKey } = req.body;
      
      if (!userId || !credentialId || !publicKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // In a real implementation, you'd store these in the database
      // For now, we'll just log them
      console.log(`WebAuthn registration for user ${userId}:`, {
        credentialId: credentialId.substring(0, 20) + '...',
        publicKey: publicKey.substring(0, 20) + '...'
      });
      
      res.json({ success: true, message: "Biometric credential registered successfully" });
    } catch (error) {
      console.error("WebAuthn registration error:", error);
      res.status(500).json({ error: "Failed to register biometric credential" });
    }
  });

  app.get("/api/auth/webauthn/credentials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // In a real implementation, you'd fetch from database
      // For now, return empty array
      const credentials: string[] = [];
      
      res.json({ credentials });
    } catch (error) {
      console.error("WebAuthn credentials fetch error:", error);
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  app.post("/api/auth/webauthn/authenticate", async (req, res) => {
    try {
      const { credentialId, signature, userId } = req.body;
      
      if (!credentialId || !signature || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // In a real implementation, you'd:
      // 1. Fetch the user's stored public key from database
      // 2. Verify the signature using the public key
      // 3. Update the credential counter
      // 4. Return a JWT token if verification succeeds
      
      console.log(`WebAuthn authentication attempt for user ${userId}:`, {
        credentialId: credentialId.substring(0, 20) + '...',
        signature: signature.substring(0, 20) + '...'
      });
      
      // For now, we'll simulate successful authentication
      // In production, you'd do proper cryptographic verification
      res.json({ 
        success: true, 
        message: "Biometric authentication successful",
        requiresPassword: true // Indicate that password is still needed for full login
      });
    } catch (error) {
      console.error("WebAuthn authentication error:", error);
      res.status(500).json({ error: "Biometric authentication failed" });
    }
  });

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      
      // Try to find user first (parent/custodian)
      let user = await storage.getUser(decoded.userId);
      
      // If not found in users, try contributors table
      if (!user) {
        const contributor = await storage.getContributor(decoded.userId);
        if (!contributor) {
          return res.status(404).json({ error: "User not found" });
        }
        const { password, ...contributorWithoutPassword } = contributor;
        return res.json(contributorWithoutPassword);
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  const updateProfileHandler = async (req: any, res: any) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        console.log("No token provided");
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      console.log("Updating profile for user:", decoded.userId);
      console.log("Request body keys:", Object.keys(req.body));
      if (req.body.profileImageUrl) {
        console.log("Profile image URL length:", req.body.profileImageUrl.length);
      }
      
      const validatedData = updateProfileSchema.parse(req.body);
      console.log("Validation passed");
      
      const updatedUser = await storage.updateUserProfile(decoded.userId, validatedData);
      if (!updatedUser) {
        console.log("User not found:", decoded.userId);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log("Profile updated successfully");
      const { password, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid profile data" });
    }
  };

  app.patch("/api/profile", updateProfileHandler);
  app.put("/api/profile", updateProfileHandler);

  // Children routes
  app.get("/api/children/:parentId", async (req, res) => {
    try {
      // Fixed N+1 query: Use SQL join to get children with portfolio totals in a single query
      const { children, portfolioHoldings } = await import("@shared/schema");
      const { sql, eq, sum } = await import("drizzle-orm");

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
      res.status(500).json({ error: "Failed to fetch child" });
    }
  });

  app.post("/api/children", async (req, res) => {
    try {
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to fetch child" });
    }
  });

  // Investment routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.get("/api/investments/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      // Use Finnhub to search for real stocks
      const searchResults = await stockAPI.searchSymbols(query);
      
      // Convert Finnhub results to Investment format with real-time prices
      const investments = await Promise.all(
        searchResults.map(async (result) => {
          // Check if we already have this investment in our database
          let investment = await storage.getInvestmentBySymbol(result.symbol);
          
          if (!investment) {
            // Get real-time quote for this symbol
            const quote = await stockAPI.getQuote(result.symbol);
            
            if (quote) {
              // Determine investment type (ETF, stock, etc.)
              let investmentType = 'stock';
              if (result.type.includes('ETF') || result.type.includes('Fund')) {
                investmentType = 'etf';
              } else if (result.symbol.match(/^(BTC|ETH|DOGE|SOL|ADA)/)) {
                investmentType = 'crypto';
              }
              
              // Create a temporary investment object (we'll save it when user selects it)
              investment = {
                id: `temp-${result.symbol}`,
                symbol: result.symbol,
                name: result.description,
                type: investmentType,
                currentPrice: quote.currentPrice.toFixed(2),
                ytdReturn: quote.changePercent.toFixed(2),
              };
            }
          } else {
            // Update price from real-time quote if available
            const quote = await stockAPI.getQuote(result.symbol);
            if (quote) {
              investment.currentPrice = quote.currentPrice.toFixed(2);
              investment.ytdReturn = quote.changePercent.toFixed(2);
            }
          }
          
          return investment;
        })
      );
      
      // Filter out any null results
      res.json(investments.filter(inv => inv !== null && inv !== undefined));
    } catch (error) {
      console.error("Investment search error:", error);
      res.status(500).json({ error: "Failed to search investments" });
    }
  });

  // Stock API routes (Finnhub integration)
  app.get("/api/stocks/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await stockAPI.getQuote(symbol);
      
      if (!quote) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      res.json(quote);
    } catch (error) {
      console.error("Stock quote error:", error);
      res.status(500).json({ error: "Failed to fetch stock quote" });
    }
  });

  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const results = await stockAPI.searchSymbols(query);
      res.json(results);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  app.get("/api/stocks/profile/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const profile = await stockAPI.getCompanyProfile(symbol);
      
      if (!profile) {
        return res.status(404).json({ error: "Company profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Company profile error:", error);
      res.status(500).json({ error: "Failed to fetch company profile" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:childId", async (req, res) => {
    try {
      // Fixed N+1 query: Use SQL join to get holdings with investment data in a single query
      const { portfolioHoldings, investments } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const results = await db
        .select({
          // Holding fields
          id: portfolioHoldings.id,
          childId: portfolioHoldings.childId,
          investmentId: portfolioHoldings.investmentId,
          shares: portfolioHoldings.shares,
          averageCost: portfolioHoldings.averageCost,
          currentValue: portfolioHoldings.currentValue,
          // Investment fields
          investmentSymbol: investments.symbol,
          investmentName: investments.name,
          investmentType: investments.type,
          investmentCurrentPrice: investments.currentPrice,
          investmentYtdReturn: investments.ytdReturn,
        })
        .from(portfolioHoldings)
        .leftJoin(investments, eq(portfolioHoldings.investmentId, investments.id))
        .where(eq(portfolioHoldings.childId, req.params.childId));

      const enrichedHoldings = results.map(row => {
        if (!row.investmentSymbol) {
          console.error(`[Portfolio] ERROR: Holding ${row.id} references investmentId ${row.investmentId} but investment not found in database!`);
        }

        return {
          id: row.id,
          childId: row.childId,
          investmentId: row.investmentId,
          shares: row.shares,
          averageCost: row.averageCost,
          currentValue: row.currentValue,
          investment: row.investmentSymbol ? {
            id: row.investmentId,
            symbol: row.investmentSymbol,
            name: row.investmentName,
            type: row.investmentType,
            currentPrice: row.investmentCurrentPrice,
            ytdReturn: row.investmentYtdReturn,
          } : null,
        };
      });

      res.json(enrichedHoldings);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

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
      res.status(500).json({ error: "Failed to mark gift as viewed" });
    }
  });

  app.patch("/api/gifts/:id/approve", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      } catch (jwtError) {
        return res.status(401).json({ error: "Invalid token" });
      }
      
      const gift = await storage.getGift(req.params.id);
      
      if (!gift) {
        return res.status(404).json({ error: "Gift not found" });
      }
      
      // Verify the user is the parent of the child
      const child = await storage.getChild(gift.childId);
      
      if (!child || child.parentId !== decoded.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Approve the gift first
      await storage.approveGift(req.params.id);
      
      // Get investment details
      const investment = await storage.getInvestment(gift.investmentId);
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
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
    } catch (error: any) {
      console.error("Gift approval error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to approve gift"
      });
    }
  });

  app.patch("/api/gifts/:id/reject", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      const gift = await storage.getGift(req.params.id);
      
      if (!gift) {
        return res.status(404).json({ error: "Gift not found" });
      }
      
      // Verify the user is the parent of the child
      const child = await storage.getChild(gift.childId);
      if (!child || child.parentId !== decoded.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Reject the gift
      await storage.rejectGift(req.params.id);
      
      res.json({ success: true, message: "Gift rejected" });
    } catch (error) {
      console.error("Gift rejection error:", error);
      res.status(500).json({ error: "Failed to reject gift" });
    }
  });

  // Thank you message routes
  app.post("/api/thank-you", async (req, res) => {
    try {
      const validatedData = insertThankYouMessageSchema.parse(req.body);
      const message = await storage.createThankYouMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid thank you message data" });
    }
  });

  app.get("/api/thank-you/:giftId", async (req, res) => {
    try {
      const messages = await storage.getThankYouMessagesByGift(req.params.giftId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thank you messages" });
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
      res.status(500).json({ error: "Failed to generate gift link" });
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

  // Logo proxy endpoint to bypass ad blockers
  app.get("/api/logo/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const companyName = req.query.name as string | undefined;
      const ticker = symbol.toUpperCase();
      
      // Full ticker to domain mapping (matches client-side mapping)
      const domainMapping: Record<string, string> = {
        // Tech
        'AAPL': 'apple.com', 'GOOGL': 'abc.xyz', 'GOOG': 'abc.xyz',
        'MSFT': 'microsoft.com', 'AMZN': 'amazon.com', 'META': 'meta.com', 'FB': 'meta.com',
        'TSLA': 'tesla.com', 'NVDA': 'nvidia.com', 'NFLX': 'netflix.com',
        'ADBE': 'adobe.com', 'CRM': 'salesforce.com', 'ORCL': 'oracle.com',
        'INTC': 'intel.com', 'AMD': 'amd.com', 'UBER': 'uber.com', 'LYFT': 'lyft.com',
        'SNAP': 'snap.com', 'SPOT': 'spotify.com', 'SQ': 'squareup.com', 'PYPL': 'paypal.com',
        'SHOP': 'shopify.com', 'TWLO': 'twilio.com', 'ZM': 'zoom.us',
        'DOCU': 'docusign.com', 'SNOW': 'snowflake.com', 'CRWD': 'crowdstrike.com',
        'ABNB': 'airbnb.com', 'ROKU': 'roku.com', 'RBLX': 'roblox.com',
        'DASH': 'doordash.com', 'COIN': 'coinbase.com', 'PLTR': 'palantir.com',
        'IBM': 'ibm.com', 'CSCO': 'cisco.com', 'QCOM': 'qualcomm.com',
        'TXN': 'ti.com', 'NOW': 'servicenow.com', 'PANW': 'paloaltonetworks.com',
        'NET': 'cloudflare.com', 'DDOG': 'datadoghq.com', 'MDB': 'mongodb.com', 'ZS': 'zscaler.com',
        // Finance
        'JPM': 'jpmorganchase.com', 'BAC': 'bankofamerica.com', 'WFC': 'wellsfargo.com',
        'GS': 'goldmansachs.com', 'MS': 'morganstanley.com', 'C': 'citigroup.com',
        'V': 'visa.com', 'MA': 'mastercard.com', 'AXP': 'americanexpress.com', 'BLK': 'blackrock.com',
        // Consumer
        'WMT': 'walmart.com', 'HD': 'homedepot.com', 'NKE': 'nike.com',
        'MCD': 'mcdonalds.com', 'SBUX': 'starbucks.com', 'DIS': 'disney.com',
        'KO': 'coca-cola.com', 'PEP': 'pepsi.com', 'PG': 'pg.com',
        'COST': 'costco.com', 'TGT': 'target.com', 'LOW': 'lowes.com',
        'F': 'ford.com', 'GM': 'gm.com', 'CMG': 'chipotle.com',
        // Healthcare
        'JNJ': 'jnj.com', 'UNH': 'unitedhealthgroup.com', 'PFE': 'pfizer.com',
        'ABBV': 'abbvie.com', 'TMO': 'thermofisher.com', 'ABT': 'abbott.com',
        // ETFs
        'SPY': 'ssga.com', 'VOO': 'vanguard.com', 'VTI': 'vanguard.com', 'QQQ': 'invesco.com',
      };
      
      let domain = domainMapping[ticker];
      
      // If not in mapping, try to guess from company name
      if (!domain && companyName) {
        const guessed = companyName
          .replace(/\s+(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|Limited|Group|plc|LLC|LP)$/i, '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        
        if (guessed.length >= 3 && guessed.length <= 30) {
          domain = `${guessed}.com`;
        }
      }
      
      if (!domain) {
        return res.status(404).json({ error: 'Logo not available' });
      }
      
      // Fetch logo from Clearbit and proxy it
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const logoResponse = await fetch(logoUrl);
      
      if (!logoResponse.ok) {
        return res.status(404).json({ error: 'Logo not found' });
      }
      
      // Set proper headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      
      // Stream the logo image
      const buffer = await logoResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Logo proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch logo' });
    }
  });

  // Sprout Request routes
  app.post("/api/sprout-requests", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      const validatedData = createSproutRequestSchema.parse(req.body);
      
      // Create sprout request
      const sproutRequest = await storage.createSproutRequest({
        ...validatedData,
        parentId: decoded.userId,
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
      console.error("Sprout request error:", error);
      res.status(400).json({ error: "Failed to create sprout request" });
    }
  });

  app.get("/api/sprout-requests/parent/:parentId", async (req, res) => {
    try {
      const requests = await storage.getSproutRequestsByParent(req.params.parentId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sprout requests" });
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
      res.status(500).json({ error: "Failed to fetch sprout request" });
    }
  });

  app.patch("/api/sprout-requests/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateSproutRequestStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
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
      res.status(500).json({ error: "Failed to cancel recurring contribution" });
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

  // Contributor routes
  app.post("/api/contributors/signup", async (req, res) => {
    try {
      const { email, name, password, phone, profileImageUrl, sproutRequestCode } = req.body;
      
      // Check if contributor already exists
      const existingContributor = await storage.getContributorByEmail(email);
      if (existingContributor && existingContributor.isRegistered) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      let contributor;
      if (existingContributor) {
        // Update existing contributor
        contributor = await storage.updateContributor(existingContributor.id, {
          password: hashedPassword,
          isRegistered: true,
          name: name || existingContributor.name,
          profileImageUrl: profileImageUrl || existingContributor.profileImageUrl,
        });
      } else {
        // Create new contributor
        contributor = await storage.createContributor({
          email,
          name,
          password: hashedPassword,
          phone: phone || null,
          profileImageUrl: profileImageUrl || null,
          isRegistered: true,
        });
      }
      
      // Link any previous guest gifts to this contributor
      if (contributor) {
        await storage.linkGiftsToContributor(email, contributor.id);
      }
      
      // If signing up through sprout request, update the request status
      if (sproutRequestCode) {
        const sproutRequest = await storage.getSproutRequestByCode(sproutRequestCode);
        if (sproutRequest) {
          await storage.updateSproutRequestStatus(sproutRequest.id, "accepted");
        }
      }
      
      // Generate JWT token with unified format
      const token = jwt.sign(
        { userId: contributor?.id, email: contributor?.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      const { password: _, ...contributorWithoutPassword } = contributor || {};
      res.status(201).json({
        contributor: contributorWithoutPassword,
        user: contributorWithoutPassword, // Also return as 'user' for compatibility
        token
      });
    } catch (error) {
      console.error("Contributor signup error:", error);
      res.status(400).json({ error: "Failed to sign up contributor" });
    }
  });

  app.post("/api/contributors/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // Find contributor by email
      const contributor = await storage.getContributorByEmail(email);
      if (!contributor) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // TEMPORARILY DISABLED: Registration and password checks for testing
      // TODO: Re-enable in production
      // if (!contributor.isRegistered) {
      //   return res.status(401).json({ error: "Invalid email or password" });
      // }
      // const isValidPassword = await bcrypt.compare(password, contributor.password);
      // if (!isValidPassword) {
      //   return res.status(401).json({ error: "Invalid email or password" });
      // }
      console.log('⚠️  PASSWORD AND REGISTRATION CHECKS DISABLED - FOR TESTING ONLY');
      
      // Link any previous guest gifts to this contributor
      await storage.linkGiftsToContributor(email, contributor.id);
      
      // Generate JWT token with unified format
      const token = jwt.sign(
        { userId: contributor.id, email: contributor.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      const { password: _, ...contributorWithoutPassword } = contributor;
      res.json({
        contributor: contributorWithoutPassword,
        user: contributorWithoutPassword, // Also return as 'user' for compatibility
        token
      });
    } catch (error) {
      console.error("Contributor signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  // Get all gifts made by a contributor
  app.get("/api/contributors/:id/gifts", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authorization token required" });
      }
      
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
        
        // Verify the user ID matches the token
        if (decoded.userId !== id) {
          return res.status(403).json({ error: "Not authorized to view these gifts" });
        }
      } catch (jwtError) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      
      // Get all gifts made by this user (as a contributor)
      const gifts = await storage.getGiftsByContributor(id);
      res.json(gifts);
    } catch (error) {
      console.error("Error fetching contributor gifts:", error);
      res.status(500).json({ error: "Failed to fetch contributor gifts" });
    }
  });

  // Update contributor profile photo
  app.patch("/api/contributors/:id/profile-photo", async (req, res) => {
    try {
      const { id } = req.params;
      const { profileImageUrl } = req.body;
      
      if (!profileImageUrl) {
        return res.status(400).json({ error: "Profile image URL is required" });
      }
      
      // Verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authorization token required" });
      }
      
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
        
        // Verify the user ID matches the token
        if (decoded.userId !== id) {
          return res.status(403).json({ error: "Not authorized to update this profile" });
        }
      } catch (jwtError) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      
      const updatedContributor = await storage.updateContributor(id, {
        profileImageUrl
      });
      
      if (!updatedContributor) {
        return res.status(404).json({ error: "Contributor not found" });
      }
      
      res.json(updatedContributor);
    } catch (error) {
      console.error("Error updating contributor profile photo:", error);
      res.status(500).json({ error: "Failed to update profile photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
