import { container } from "@/features";
import { createAnkangRouter } from "@/router/ankang";
import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { schema } from "@yanglee2421/db";
import { logger } from "hono/logger";
import process from "node:process";
import { fromEventPattern, merge, Observable, takeUntil } from "rxjs";
import { factory } from "./infra/app-factory";

const exit$ = fromEventPattern(
  (f) => process.on("exit", f),
  (f) => process.off("exit", f),
);
const sigint$ = fromEventPattern(
  (f) => process.on("SIGINT", f),
  (f) => process.off("SIGINT", f),
);
const sigterm$ = fromEventPattern(
  (f) => process.on("SIGTERM", f),
  (f) => process.off("SIGTERM", f),
);
const processExit$ = merge(exit$, sigint$, sigterm$);
const bootstrap$ = new Observable<ServerType>((sub) => {
  const app = factory.createApp();

  app.use(logger());
  app.get("/", async (c) => {
    const db = container.cradle.db.client;
    const rows = await db.select().from(schema.users);

    return c.json({ rows });
  });

  const ankang = createAnkangRouter();

  app.route("/", ankang);

  const server = serve({ ...app, port: 8080, hostname: "127.0.0.1" }, (info) => {
    console.log(info);
  });
  sub.next(server);

  return () => {
    server.close();
  };
});

bootstrap$.pipe(takeUntil(processExit$)).subscribe();
