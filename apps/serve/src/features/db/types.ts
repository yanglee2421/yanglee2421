import type { relations } from "@yanglee2421/db";
import type { NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";
import type { DatabaseSync } from "node:sqlite";

export type DBClientType = NodeSQLiteDatabase<typeof relations> & {
  $client: DatabaseSync;
};
