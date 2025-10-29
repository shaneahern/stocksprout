// Load .env FIRST only in development
// In production, use environment variables from the deployment platform
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

if (process.env.NODE_ENV !== "production") {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  config({ path: resolve(__dirname, "..", ".env") });
}

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "In production, set this in your deployment platform's secrets/environment variables. " +
    "For local development, create a .env file with DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
