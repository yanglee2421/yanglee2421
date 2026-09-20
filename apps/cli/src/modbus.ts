// create an empty modbus client
import ModbusRTU from "modbus-serial";

export const handleModbus = () => {
  const client = new ModbusRTU();

  // open connection to a serial port
  client.connectRTUBuffered(
    "COM1",
    { baudRate: 9600, dataBits: 8, stopBits: 2, parity: "none" },
    async () => {
      try {
        client.setID(1);
        client.setTimeout(2000);

        for (let i = 0; i < 8; i++) {
          await client.writeCoil(0xfc00 + i, true);
        }
        const result = await client.writeCoil(0xfc00 + 0o40, true);

        console.log(result.state);

        const cols = await client.readCoils(0xf800, 1);

        console.log(cols.data);
      } catch (error) {
        console.error(error);
      }
    },
  );
};
