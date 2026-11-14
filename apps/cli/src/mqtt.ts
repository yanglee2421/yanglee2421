import mqtt from "mqtt";
import type { Subscription } from "rxjs";
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  fromEventPattern,
  ignoreElements,
  map,
  merge,
  Observable,
  retry,
  switchMap,
  takeUntil,
  tap,
  timer,
} from "rxjs";

export class MqttDemo {
  readonly mqttURI$ = new BehaviorSubject<string>("");
  readonly deviceId$ = new BehaviorSubject<string>("");
  private subscription: Subscription;

  constructor() {
    this.subscription = combineLatest([this.mqttURI$, this.deviceId$])
      .pipe(
        switchMap(([mqttURI, deviceId]) => {
          if (!mqttURI) {
            return EMPTY;
          }

          if (!deviceId) {
            return EMPTY;
          }

          return createMqtt(mqttURI).pipe(
            switchMap((client) => {
              const connect$ = fromEventPattern(
                (f) => client.on("connect", f),
                (f) => client.off("connect", f),
              );
              const error$ = fromEventPattern(
                (f) => client.on("error", f),
                (f) => client.off("error", f),
              );
              const close$ = fromEventPattern(
                (f) => client.on("close", f),
                (f) => client.off("close", f),
              );
              const device_up$ = fromEventPattern<[unknown]>(
                (f) => client.subscribe("device/up", f),
                (f) => client.unsubscribe("device/up", f),
              );
              const message$ = fromEventPattern<[string, Buffer]>(
                (f) => client.on("message", f),
                (f) => client.off("message", f),
              );
              const reconnect$ = fromEventPattern(
                (f) => client.on("reconnect", f),
                (f) => client.off("reconnect", f),
              );
              const offline$ = fromEventPattern(
                (f) => client.on("offline", f),
                (f) => client.off("offline", f),
              );

              return merge(
                connect$.pipe(
                  switchMap(() => device_up$),
                  tap(([err]) => {
                    console.log("[MQTT] 已订阅主题 device/up", err);

                    if (err) {
                      throw err;
                    }
                  }),
                  switchMap(() => message$),
                  map(([, payload]) => payload.toString()),
                ),
                reconnect$.pipe(ignoreElements()),
                error$.pipe(
                  tap(() => {
                    throw new Error("error");
                  }),
                ),
                offline$.pipe(
                  tap(() => {
                    throw new Error("offline");
                  }),
                ),
              ).pipe(takeUntil(close$));
            }),
          );
        }),
        tap((value) => {
          console.log(value);
        }),
        retry({
          count: Infinity,
          resetOnSuccess: true,
          delay: () => timer(1000 * 2),
        }),
      )
      .subscribe();
  }
  dispose() {
    this.subscription.unsubscribe();
  }
}

const createMqtt = (mqttURI: string) => {
  return new Observable<mqtt.MqttClient>((sub) => {
    const client = mqtt.connect(mqttURI, {
      clientId: `location1-info-${Date.now()}`,
      connectTimeout: 5000,
      keepalive: 5,
      reconnectPeriod: 3000,
      clean: true,
    });

    sub.next(client);

    return () => {
      client.end();
    };
  });
};
