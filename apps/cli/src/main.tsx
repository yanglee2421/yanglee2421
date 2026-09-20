import { Box, render, Static, Text, useCursor, useInput } from "ink";
import React from "react";
import { handleMain } from "./cpp";
import { fswatch$ } from "./fs";
import { handleModbus } from "./modbus";
import { MqttDemo } from "./mqtt";
import { confrim$ as confirm$, inputWindow$ } from "./scanner";

const handleMqtt = () => {
  const demo = new MqttDemo();
  demo.mqttURI$.next("ws://ruihuizg.cn:8083/mqtt");
  demo.deviceId$.next("26");

  return demo;
};

const Counter = () => {
  const [inputText, setInput] = React.useState("");
  const [items, setItems] = React.useState<string[]>([]);

  const ref = React.useRef<MqttDemo | null>(null);

  const cursor = useCursor();

  useInput((input, key) => {
    if (key.backspace) {
      setInput((prev) => {
        const val = prev.slice(0, -1);
        cursor.setCursorPosition({ x: val.length, y: 1 });
        return val;
      });
      return;
    }

    if (key.return) {
      switch (inputText) {
        case "yl":
          handleMain();
          break;
        case "mqtt":
          ref.current = handleMqtt();
          break;
        case "mqtte":
          ref.current?.dispose();
          break;
        case "openform":
          inputWindow$.next(true);
          break;
        case "closeform":
          inputWindow$.next(false);
          break;
        case "confirmtrue":
          confirm$.next(true);
          break;
        case "confirmfalse":
          confirm$.next(false);
          break;
        case "watch":
          fswatch$.subscribe((value) => {
            console.log(value);
          });
          break;
        case "watchclose":
          break;
        case "modbus":
          handleModbus();
          break;
        case "exit":
          process.exit();
          break;
        default:
          break;
      }

      setItems((prev) => [...prev, inputText]);
      setInput("");
      cursor.setCursorPosition(void 0);

      return;
    }

    setInput((prev) => {
      const val = prev + input;
      cursor.setCursorPosition({ x: val.length, y: 1 });
      return val;
    });
  });

  return (
    <>
      <Static items={items}>
        {(item, index) => (
          <Box key={index}>
            <Text>{index + 1}. </Text>
            <Text color="blue">{item}</Text>
          </Box>
        )}
      </Static>
      <Text>Command Start</Text>
      <Text color="red">{inputText}</Text>
    </>
  );
};

export const main = () => {
  return render(<Counter />);
};

void main();
