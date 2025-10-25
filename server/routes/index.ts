import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAuthRoutes } from "./auth.routes";
import { registerChildrenRoutes } from "./children.routes";
import { registerPortfolioRoutes } from "./portfolio.routes";
import { registerGiftRoutes } from "./gifts.routes";
import { registerContributorRoutes } from "./contributors.routes";
import { registerSproutRoutes } from "./sprout.routes";
import { registerMiscRoutes } from "./misc.routes";

/**
 * Register all application routes
 * Routes are organized by domain:
 * - auth.routes: Authentication and profile management
 * - children.routes: Child management and gift links
 * - portfolio.routes: Investments, stocks, and portfolio holdings
 * - gifts.routes: Gift creation, approval, and thank you messages
 * - contributors.routes: Contributor signup, signin, and management
 * - sprout.routes: Sprout requests and recurring contributions
 * - misc.routes: File uploads, test endpoints, static files
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerAuthRoutes(app);
  registerChildrenRoutes(app);
  registerPortfolioRoutes(app);
  registerGiftRoutes(app);
  registerContributorRoutes(app);
  registerSproutRoutes(app);
  registerMiscRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
