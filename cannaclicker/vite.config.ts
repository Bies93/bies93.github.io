import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig({
  base: "/",
  plugins: [
    compression({ algorithm: "brotliCompress", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),
  ],
  build: {
    sourcemap: true,
  },
});