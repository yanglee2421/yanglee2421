import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import pLimit from "p-limit";
import { Observable } from "rxjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDir = async (dir: string) => {
  // Output must can be accessed
  try {
    await fs.promises.access(dir, fs.constants.R_OK);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
    return;
  }

  const dirState = await fs.promises.stat(dir);

  if (!dirState.isDirectory()) {
    throw new Error(`Output path ${dir} is not a directory.`);
  }
};

export const flatLs = async (dir: string): Promise<string[]> => {
  const state = await fs.promises.stat(dir);

  if (state.isFile()) {
    return [dir];
  }

  if (!state.isDirectory()) {
    return [];
  }

  const basenames = await fs.promises.readdir(dir);
  const limit = pLimit(1000);

  const tasks = basenames.map(async (basename) => {
    const subPath = path.resolve(dir, basename);
    const result = limit(() => flatLs(subPath));

    return result;
  });

  const results = await Promise.all(tasks);

  return results.flat();
};

export const copyDir = async (source: string, destination: string): Promise<string[]> => {
  const inputState = await fs.promises.stat(source);

  if (inputState.isFile()) {
    await ensureDir(path.dirname(destination));
    await fs.promises.copyFile(source, destination, fs.constants.COPYFILE_EXCL);
    return [destination];
  }

  if (!inputState.isDirectory()) {
    return [];
  }

  await ensureDir(destination);

  // List Directory Contents
  const basenames = await fs.promises.readdir(source);
  const limit = pLimit(1000);

  // Loop for Each Item
  const tasks = basenames.map(async (basename) => {
    const subSource = path.resolve(source, basename);
    const subDestination = path.resolve(destination, basename);

    return limit(() => copyDir(subSource, subDestination));
  });

  const results = await Promise.all(tasks);

  return results.flat();
};

export const fswatch$ = new Observable<{ eventType: string; filename: string | NonSharedBuffer }>(
  (sub) => {
    const watcher = fs.watch(path.resolve(__dirname, "./watch"), { recursive: true });

    watcher.on("change", (eventType, filename) => {
      sub.next({ eventType, filename });
    });
    watcher.on("error", (error) => {
      sub.error(error);
    });
    watcher.on("close", () => {
      sub.complete();
    });

    return () => {
      watcher.close();
    };
  },
);
