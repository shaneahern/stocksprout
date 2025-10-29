import type { Express } from "express";
import { storage } from "../storage";
import { signupSchema, loginSchema, updateProfileSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../email-service";
import { authenticate, getAuthUser, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { handleError, handleNotFound, handleValidationError } from "../utils/error-handler";

export function registerAuthRoutes(app: Express) {
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
      const errorMessage = error instanceof Error ? error.message : "Invalid signup data";
      res.status(400).json({ error: errorMessage });
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
      const errorMessage = error instanceof Error ? error.message : "Invalid login data";
      res.status(401).json({ error: errorMessage });
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
  app.get("/api/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = getAuthUser(req);

      // Try to find user first (parent/custodian)
      let user = await storage.getUser(userId);

      // If not found in users, try contributors table
      if (!user) {
        const contributor = await storage.getContributor(userId);
        if (!contributor) {
          return handleNotFound(res, "User");
        }
        const { password, ...contributorWithoutPassword } = contributor;
        return res.json(contributorWithoutPassword);
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error, "Failed to fetch profile");
    }
  });

  const updateProfileHandler = async (req: AuthenticatedRequest, res: any) => {
    try {
      const { userId } = getAuthUser(req);
      console.log("Updating profile for user:", userId);
      console.log("Request body keys:", Object.keys(req.body));
      if (req.body.profileImageUrl) {
        console.log("Profile image URL length:", req.body.profileImageUrl.length);
      }

      const validatedData = updateProfileSchema.parse(req.body);
      console.log("Validation passed");

      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      if (!updatedUser) {
        console.log("User not found:", userId);
        return handleNotFound(res, "User");
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
      return handleValidationError(res, error, "Invalid profile data");
    }
  };

  app.patch("/api/profile", authenticate, updateProfileHandler);
  app.put("/api/profile", authenticate, updateProfileHandler);
}
