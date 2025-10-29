/**
 * Vite configuration for @stocksprout/web
 * 
 * This config points to the client/ directory at the project root
 * since the monorepo structure currently keeps web app files in client/
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

export default defineConfig(async () => {
  const plugins: any[] = [
    react(),
    runtimeErrorOverlay(),
  ];

  // Add Replit-specific plugins only in development on Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(cartographer(), devBanner());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "client", "src"),
        "@shared": path.resolve(projectRoot, "shared"),
        "@assets": path.resolve(projectRoot, "attached_assets"),
        "react-native": "react-native-web",
      },
    },
    root: path.resolve(projectRoot, "client"),
    publicDir: path.resolve(projectRoot, "client", "public"),
    css: {
      postcss: path.resolve(projectRoot, "client", "postcss.config.js"),
    },
    build: {
      outDir: path.resolve(projectRoot, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
