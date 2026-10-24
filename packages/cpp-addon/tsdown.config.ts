import path from "node:path";
import url from "node:url";
import { defineConfig } from "tsdown";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const calcualteJSExtension = (format: string) => {
  switch (format) {
    case "es":
      return ".mjs";
    case "cjs":
      return ".cjs";
    default:
      return ".js";
  }
};

const calcualteDTSExtension = (format: string) => {
  switch (format) {
    case "es":
      return ".d.mts";
    case "cjs":
      return ".d.cts";
    default:
      return ".d.ts";
  }
};

export default defineConfig(() => {
  return {
    // Input
    entry: ["src/main.ts"],
    deps: {
      neverBundle: true,
    },

    // Output
    outDir: path.resolve(__dirname, "dist"),
    outExtensions: ({ format }) => {
      return {
        js: calcualteJSExtension(format),
        dts: calcualteDTSExtension(format),
      };
    },
    format: "esm",
    platform: "node",
    target: "node24",
    dts: true,
    minify: false,
    fixedExtension: false,

    // Chore
    plugins: [],
    clean: true,
    onSuccess: async () => {},
  };
});
