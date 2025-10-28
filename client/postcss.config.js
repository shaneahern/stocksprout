import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

export default {
  plugins: {
    tailwindcss: {
      config: resolve(projectRoot, "tailwind.config.ts"),
    },
    autoprefixer: {},
  },
}
