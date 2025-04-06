import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";
import svgr from "vite-plugin-svgr";

// Using import.meta.url to construct __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: { overrides: { removeViewBox: false } },
            },
          ],
        },
      },
    }),
    react(),
  ],
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      "@global": path.resolve(__dirname, "src/global"),
      "@common": path.resolve(__dirname, "src/_common"),
    },
  },
});
