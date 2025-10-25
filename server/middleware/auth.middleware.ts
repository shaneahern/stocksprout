import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extended Request type with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to authenticate requests using JWT token
 * Extracts Bearer token from Authorization header and verifies it
 *
 * Usage:
 *   app.get("/api/protected", authenticate, (req: AuthenticatedRequest, res) => {
 *     const userId = req.user.userId;
 *     // ...
 *   });
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as { userId: string; email: string };

    // Attach user info to request
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Middleware to optionally authenticate requests
 * Sets req.user if token is valid, but doesn't fail if missing
 *
 * Usage:
 *   app.get("/api/maybe-protected", optionalAuthenticate, (req: AuthenticatedRequest, res) => {
 *     if (req.user) {
 *       // User is logged in
 *     } else {
 *       // Anonymous user
 *     }
 *   });
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      ) as { userId: string; email: string };

      (req as AuthenticatedRequest).user = decoded;
    }

    next();
  } catch (error) {
    // Token is invalid, but that's OK for optional auth
    console.warn("Optional authentication failed:", error);
    next();
  }
}

/**
 * Get authenticated user info from request
 * Throws error if not authenticated (should be used after authenticate middleware)
 */
export function getAuthUser(req: Request): { userId: string; email: string } {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user;
}
