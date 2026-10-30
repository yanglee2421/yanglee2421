import type { DBService } from "./db";
import type { HashService } from "./hash";

export interface AppCradle {
  dbPath: string;
  rounds: number;

  db: DBService;
  hash: HashService;
}
