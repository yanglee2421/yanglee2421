import { parse } from "csv/sync";
import iconv from "iconv-lite";
import { exec } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";
import {
  distinctUntilChanged,
  from,
  fromEventPattern,
  interval,
  map,
  merge,
  switchMap,
} from "rxjs";

export const exit$ = fromEventPattern(
  (f) => process.on("exit", f),
  (f) => process.off("exit", f),
);
export const sigint$ = fromEventPattern(
  (f) => process.on("SIGINT", f),
  (f) => process.off("SIGINT", f),
);
export const sigterm$ = fromEventPattern(
  (f) => process.on("SIGTERM", f),
  (f) => process.off("SIGTERM", f),
);
export const processExit$ = merge(exit$, sigint$, sigterm$);

const execAsync = promisify(exec);
export const tasklist$ = interval(1000).pipe(
  switchMap(() => {
    const cmd = `tasklist /FI "IMAGENAME eq 货车轮轴超声波自动探伤系统.exe" /FO CSV`;

    return from(execAsync(cmd, { encoding: "buffer" })).pipe(
      map((r) => {
        const str = iconv.decode(r.stdout, "gbk").toString();
        const result = parse(str);

        return result.flat(Infinity).includes("货车轮轴超声波自动探伤系统.exe");
      }),
    );
  }),
  distinctUntilChanged(),
);
