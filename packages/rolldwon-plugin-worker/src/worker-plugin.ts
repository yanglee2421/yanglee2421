import type { Plugin } from "rolldown";

export const workerPlugin = (): Plugin => {
  return {
    name: "resolver-worker",
    load: {
      filter: { id: /\?worker&url$/ },
      async handler(id) {
        const workerFilePath = id.replace("?worker&url", "");

        const referenceId = this.emitFile({
          type: "chunk",
          id: workerFilePath,
        });

        return {
          code: `export default import.meta.ROLLDOWN_FILE_URL_${referenceId};`,
          map: null,
        };
      },
    },
  };
};
