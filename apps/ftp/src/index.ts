import FtpServer from "@electerm/ftp-srv";
import path from "node:path";
import url from "node:url";

const main = async () => {
  const server = new FtpServer({
    url: "ftp://127.0.0.1:21",
    anonymous: false,
  });

  server.on("login", ({ username, password }, resolve, reject) => {
    if (username === "admin" && password === "secret") {
      const __filename = url.fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const root = path.resolve(__dirname, "../dist");

      return resolve({ root });
    }

    return reject(new Error("Invalid credentials"));
  });

  await server.listen();
};

main();
