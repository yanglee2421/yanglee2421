import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "./src/index.ts",
    deps: { neverBundle: true },

    outDir: "dist",
    format: "esm",
    platform: "neutral",
    shims: false,
    dts: true,
  },
});
