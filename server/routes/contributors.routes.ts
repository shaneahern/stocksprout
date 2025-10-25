import type { Express} from "express";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { handleError, handleNotFound, handleForbidden, handleValidationError } from "../utils/error-handler";

export function registerContributorRoutes(app: Express) {
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
  app.get("/api/contributors/:id/gifts", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { id } = req.params;

      // Verify the user ID matches the token
      if (userId !== id) {
        return handleForbidden(res, "You can only view your own gifts");
      }

      // Get all gifts made by this user (as a contributor)
      const gifts = await storage.getGiftsByContributor(id);
      res.json(gifts);
    } catch (error) {
      return handleError(res, error, "Failed to fetch contributor gifts");
    }
  });

  // Update contributor profile photo
  app.patch("/api/contributors/:id/profile-photo", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);
      const { id } = req.params;
      const { profileImageUrl } = req.body;

      if (!profileImageUrl) {
        return handleValidationError(res, new Error("Profile image URL is required"));
      }

      // Verify the user ID matches the token
      if (userId !== id) {
        return handleForbidden(res, "You can only update your own profile");
      }

      const updatedContributor = await storage.updateContributor(id, {
        profileImageUrl
      });

      if (!updatedContributor) {
        return handleNotFound(res, "Contributor");
      }

      res.json(updatedContributor);
    } catch (error) {
      return handleError(res, error, "Failed to update profile photo");
    }
  });
}
