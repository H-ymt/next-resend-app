import { publicProcedure, router } from "../index";
import { contactRouter } from "./contact";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	contact: contactRouter,
});
export type AppRouter = typeof appRouter;
