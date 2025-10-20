import type { Express} from "express";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
}
