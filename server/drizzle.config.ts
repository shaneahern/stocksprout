import type { Config } from "drizzle-kit";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Support both monorepo structure (from server/) and flat structure (from root)
const schemaPath = resolve(__dirname, "..", "shared", "schema.ts");

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Drizzle migrations may fail.");
}

export default {
  out: resolve(__dirname, "..", "migrations"),
  schema: schemaPath,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config;
