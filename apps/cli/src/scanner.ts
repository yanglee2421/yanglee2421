import { FXPLCClientMock, TransportSerial } from "node-fxplc";
import net from "node:net";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concat,
  concatMap,
  defer,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  interval,
  merge,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { InterByteTimeoutParser, SerialPort } from "serialport";

export const scanBySerialPort = () => {
  return new Observable<string>((sub) => {
    const port = new SerialPort({
      path: "COM1",
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
    });

    // const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    const parser = port.pipe(new InterByteTimeoutParser({ interval: 30 }));

    parser.on("data", (data: Buffer) => {
      sub.next(data.toString());
    });
    parser.on("error", (error) => {
      sub.error(error);
    });
    parser.on("close", () => {
      sub.complete();
    });

    return () => {
      parser.destroy();
      port.close();
    };
  });
};

export const scanAsTCPClient = () => {
  return new Observable<string>((sub) => {
    const client = net.createConnection({
      host: "192.168.2.199",
      port: 9601,
    });

    client.on("data", (data) => {
      sub.next(data.toString());
    });
    client.on("error", (error) => {
      sub.error(error);
    });
    client.on("close", () => {
      sub.complete();
    });

    return () => {
      client.destroy();
    };
  });
};

export const scanAsTCPServer = () => {
  const socket$ = new Subject<string>();
  const server$ = new Observable<net.Server>((sub) => {
    const server = net.createServer((socket) => {
      socket.on("data", (data) => {
        socket$.next(data.toString());
      });
      socket.on("error", (err) => {
        socket$.error(err);
      });
      socket.on("close", () => {
        socket$.complete();
      });
    });

    server.on("listening", () => {
      sub.next(server);
    });
    server.on("error", (error) => {
      sub.error(error);
    });
    server.on("close", () => {
      sub.complete();
    });

    server.listen(9606, "0.0.0.0", () => {
      console.log("TCP Server listening on 9606");
    });

    return () => {
      server.close();
    };
  });

  return { server$, socket$ };
};

const port = new TransportSerial({ path: "COM1", timeout: 1000 * 2 });
const plc = new FXPLCClientMock(port);
// 可以扫码
const m111$ = interval(1000).pipe(switchMap(() => plc.readBit("M111")));
// 扫码推轮
const m112$ = interval(1000).pipe(switchMap(() => plc.readBit("M112")));
// 扫码不成功
const m122$ = interval(1000).pipe(
  switchMap(() => plc.readBit("M122")),
  filter((v) => v),
);
// 扫码器
const scanner$ = scanBySerialPort();
export const inputWindow$ = new BehaviorSubject(true);
const formOpen$ = inputWindow$.pipe(
  filter((open) => open),
  take(1),
);
export const confrim$ = new Subject<boolean>();

export const app$ = combineLatest([m111$, m112$])
  .pipe(
    concatMap(([m111, m112]) => {
      if (m111 !== true) {
        return EMPTY;
      }

      if (m112 !== false) {
        return EMPTY;
      }

      return merge(scanner$, m122$).pipe(
        distinctUntilChanged(),
        concatMap((value) => {
          console.log(value);

          return defer(() => {
            if (typeof value !== "string") {
              throw new Error("Scanner failed by plc");
            }

            return fromFetch("").pipe(
              switchMap((r) => from(r.json())),
              switchMap((data) => {
                // 探伤
                if (data == 1) {
                  return concat(
                    defer(() => from(plc.writeBit("M130", true))),
                    defer(() => from(plc.writeBit("M121", true))),
                    formOpen$.pipe(
                      tap(() => {
                        console.log("自动写入表单");
                      }),
                    ),
                  );
                }

                // 不探伤
                return concat(
                  defer(() => from(plc.writeBit("M130", false))),
                  defer(() => from(plc.writeBit("M121", true))),
                );
              }),
            );
          }).pipe(
            catchError((error) => {
              console.error(error);

              return formOpen$.pipe(
                switchMap(() => confrim$),
                switchMap((confirm) => {
                  return concat(
                    defer(() => from(plc.writeBit("M130", confirm))),
                    defer(() => from(plc.writeBit("M121", true))),
                  );
                }),
              );
            }),
          );
        }),
      );
    }),
    catchError((error) => {
      console.error(error);

      return EMPTY;
    }),
  )
  .subscribe();
