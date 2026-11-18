import { createRouter, publicQuery } from "./middleware";
import { socRouter } from "./socRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  soc: socRouter,
});

export type AppRouter = typeof appRouter;
