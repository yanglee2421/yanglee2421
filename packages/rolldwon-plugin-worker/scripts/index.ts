import { build } from "rolldown";
import { workerPlugin } from "../src/worker-plugin";

build({
  plugins: [workerPlugin()],
});
