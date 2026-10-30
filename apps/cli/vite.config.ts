import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "src/serve.ts",
    outDir: "dist",
    deps: {
      neverBundle: true,
    },
  },
});
