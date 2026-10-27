import { fork } from "node:child_process";
import path from "node:path";
import url from "node:url";
import type { RolldownWatcher, WatchOptions } from "rolldown";
import { watch } from "rolldown";
import { catchError, EMPTY, filter, fromEventPattern, map, Observable, switchMap, tap } from "rxjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shimFile = path.resolve(__dirname, "esm-shims.ts");

const startNode = (watcher: RolldownWatcher) => {
  return new Observable((sub) => {
    const jsPath = path.resolve(__dirname, "../dist/serve.mjs");
    const ps = fork(jsPath, { stdio: "pipe" });

    ps.on("spawn", () => {
      sub.next(ps);
    });
    ps.on("error", (error) => {
      sub.error(error);
    });
    ps.on("close", () => {
      sub.complete();
    });

    const stdoutData$ = fromEventPattern<Buffer>(
      (h) => ps.stdout?.on("data", h),
      (h) => ps.stdout?.off("data", h),
    );
    const stderrData$ = fromEventPattern<Buffer>(
      (h) => ps.stderr?.on("data", h),
      (h) => ps.stderr?.off("data", h),
    );

    const sub1 = stdoutData$
      .pipe(
        map((buf) => buf.toString().trim()),
        filter((i) => !!i),
      )
      .subscribe((msg) => {
        console.log(msg);
      });
    const sub2 = stderrData$
      .pipe(
        map((buf) => buf.toString().trim()),
        filter((i) => !!i),
      )
      .subscribe((msg) => {
        console.error(msg);
      });

    return () => {
      sub2.unsubscribe();
      sub1.unsubscribe();
      ps.removeAllListeners();
      ps.kill("SIGHUP");
    };
  }).pipe(
    tap({
      complete() {
        watcher.close();
      },
    }),
    catchError((error) => {
      console.error(error);

      return EMPTY;
    }),
  );
};

const watchOptions = (): WatchOptions => {
  return {
    input: "./src/serve.ts",
    output: {
      file: "./dist/serve.mjs",
      format: "esm",
    },
    platform: "node",
    transform: {
      inject: {
        __dirname: [shimFile, "__dirname"],
        __filename: [shimFile, "__filename"],
      },
    },
    external: (id, _parentId, isResolved) => {
      if (!isResolved) {
        if (id.startsWith(".")) {
          return false;
        }

        if (id.startsWith("@/")) {
          return false;
        }

        return true;
      } else {
        return id.includes("node_modules");
      }
    },
  };
};

const watch$ = new Observable<RolldownWatcher>((sub) => {
  const watcher = watch(watchOptions());

  watcher.on("event", (e) => {
    switch (e.code) {
      case "ERROR":
        console.error(e.error);
        break;
      case "BUNDLE_END":
        sub.next(watcher);
        break;
      default:
    }
  });

  return () => {
    watcher.clear("event");
    watcher.close();
  };
});

const dev$ = watch$.pipe(switchMap((watcher) => startNode(watcher)));
dev$.subscribe();
