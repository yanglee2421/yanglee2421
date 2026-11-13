import { relations } from "@yanglee2421/db";
import { drizzle } from "drizzle-orm/node-sqlite";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import url from "node:url";
import type { AppCradle } from "../types";
import type { DBClientType } from "./types";

export class DBService {
  readonly client: DBClientType;

  constructor({ dbPath }: AppCradle) {
    const dbClient = new DatabaseSync(dbPath);
    this.client = drizzle({ client: dbClient, relations });
  }

  dispose() {
    this.client.$client.close();
  }

  export() {
    const dbpath = this.client.$client.location();

    if (!dbpath) return Promise.resolve();

    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    return fs.promises.cp(dbpath, path.resolve(__dirname, "./db.db"));
  }
}
