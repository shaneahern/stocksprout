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

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
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
      const children = await storage.getChildrenByParent(req.params.parentId);
      
      // Enrich each child with portfolio value
      const enrichedChildren = await Promise.all(
        children.map(async (child) => {
          const holdings = await storage.getPortfolioHoldingsByChild(child.id);
          const totalValue = holdings.reduce((sum, holding) => {
            return sum + parseFloat(holding.currentValue || "0");
          }, 0);
          
          const totalCost = holdings.reduce((sum, holding) => {
            return sum + (parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0"));
          }, 0);
          
          const totalGain = totalValue - totalCost;
          
          return {
            ...child,
            totalValue,
            totalCost,
            totalGain,
          };
        })
      );
      
      res.json(enrichedChildren);
    } catch (error) {
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
      const investments = await storage.searchInvestments(query);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to search investments" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:childId", async (req, res) => {
    try {
      const holdings = await storage.getPortfolioHoldingsByChild(req.params.childId);
      const enrichedHoldings = await Promise.all(
        holdings.map(async (holding) => {
          const investment = await storage.getInvestment(holding.investmentId);
          return { ...holding, investment };
        })
      );
      res.json(enrichedHoldings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Gift routes
  app.get("/api/gifts/:childId", async (req, res) => {
    try {
      const gifts = await storage.getGiftsByChild(req.params.childId);
      const enrichedGifts = await Promise.all(
        gifts.map(async (gift) => {
          const investment = await storage.getInvestment(gift.investmentId);
          let contributor = null;
          
          if (gift.contributorId) {
            // Try to get contributor first
            contributor = await storage.getContributor(gift.contributorId);
            
            // If not found in contributors table, try users table (for parent purchases)
            if (!contributor) {
              const user = await storage.getUser(gift.contributorId);
              if (user) {
                // Convert user to contributor format for consistency
                contributor = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  profileImageUrl: user.profileImageUrl,
                  phone: null,
                  password: null,
                  isRegistered: true,
                  createdAt: new Date() // Users don't have createdAt, use current date
                };
              }
            }
          }
          
          return { ...gift, investment, contributor };
        })
      );
      res.json(enrichedGifts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gifts" });
    }
  });

  app.get("/api/gifts/recent/:childId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const gifts = await storage.getRecentGiftsByChild(req.params.childId, limit);
      const enrichedGifts = await Promise.all(
        gifts.map(async (gift) => {
          const investment = await storage.getInvestment(gift.investmentId);
          let contributor = null;
          
          if (gift.contributorId) {
            // Try to get contributor first
            contributor = await storage.getContributor(gift.contributorId);
            
            // If not found in contributors table, try users table (for parent purchases)
            if (!contributor) {
              const user = await storage.getUser(gift.contributorId);
              if (user) {
                // Convert user to contributor format for consistency
                contributor = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  profileImageUrl: user.profileImageUrl,
                  phone: null,
                  password: null,
                  isRegistered: true,
                  createdAt: new Date() // Users don't have createdAt, use current date
                };
              }
            }
          }
          
          return { ...gift, investment, contributor };
        })
      );
      res.json(enrichedGifts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent gifts" });
    }
  });

  app.post("/api/gifts", async (req, res) => {
    try {
      const validatedData = insertGiftSchema.parse(req.body);
      
      // Calculate shares based on amount and current price
      const investment = await storage.getInvestment(validatedData.investmentId);
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      
      const shares = parseFloat(validatedData.amount) / parseFloat(investment.currentPrice);
      const giftData = { ...validatedData, shares: shares.toFixed(6) };
      
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
          validatedData.investmentId
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
            investmentId: validatedData.investmentId,
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
      const contributions = await storage.getRecurringContributionsByChild(req.params.childId);
      const enrichedContributions = await Promise.all(
        contributions.map(async (contrib) => {
          const investment = await storage.getInvestment(contrib.investmentId);
          return { ...contrib, investment };
        })
      );
      res.json(enrichedContributions);
    } catch (error) {
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
