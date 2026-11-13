import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "src/serve.ts",
    deps: { neverBundle: true },

    outDir: "dist",
    format: "esm",
    platform: "node",
    shims: true,
    dts: false,
  },
});
