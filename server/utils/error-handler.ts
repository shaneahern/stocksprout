import type { Response } from "express";

/**
 * Standard error response helper
 * Provides consistent error formatting and logging
 */
export function handleError(
  res: Response,
  error: unknown,
  message: string,
  statusCode: number = 500
) {
  // Log the error for debugging
  console.error(`[Error] ${message}:`, error);

  // Send user-friendly error response
  return res.status(statusCode).json({
    error: message,
  });
}

/**
 * Handle validation errors (400)
 */
export function handleValidationError(res: Response, error: unknown, customMessage?: string) {
  const message = customMessage || "Invalid request data";
  console.error(`[Validation Error] ${message}:`, error);

  return res.status(400).json({
    error: message,
    details: error instanceof Error ? error.message : undefined,
  });
}

/**
 * Handle not found errors (404)
 */
export function handleNotFound(res: Response, resource: string) {
  return res.status(404).json({
    error: `${resource} not found`,
  });
}

/**
 * Handle unauthorized errors (401)
 */
export function handleUnauthorized(res: Response, message: string = "Unauthorized") {
  return res.status(401).json({
    error: message,
  });
}

/**
 * Handle forbidden errors (403)
 */
export function handleForbidden(res: Response, message: string = "Forbidden") {
  return res.status(403).json({
    error: message,
  });
}

/**
 * Async route handler wrapper
 * Automatically catches errors and sends 500 response
 *
 * Usage:
 *   app.get("/api/something", asyncHandler(async (req, res) => {
 *     const data = await someAsyncOperation();
 *     res.json(data);
 *   }));
 */
export function asyncHandler(
  fn: (req: any, res: Response, next?: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error("[Async Handler Error]:", error);
      res.status(500).json({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    });
  };
}
