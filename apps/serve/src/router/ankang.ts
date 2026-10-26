import { factory } from "@/infra/app-factory";

export const createAnkangRouter = () => {
  const app = factory.createApp();

  app.post("/emis/digitapi/uploadZjyxzt/:token", async (ctx) => {
    const data = await ctx.req.json();

    console.log(data);

    return ctx.json({});
  });

  return app;
};
