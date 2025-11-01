import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@next-sendgrid-app/api/context";
import { appRouter } from "@next-sendgrid-app/api/routers/index";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
	initializeSendGrid,
	sendAdminNotification,
	sendUserConfirmation,
} from "./lib/sendgrid";
import { verifyTurnstileToken } from "./lib/turnstile";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({
				context,
				env: {
					SENDGRID_API_KEY: env.SENDGRID_API_KEY,
					FROM_EMAIL: env.FROM_EMAIL,
					ADMIN_EMAIL: env.ADMIN_EMAIL,
					SITE_NAME: env.SITE_NAME,
					TURNSTILE_SECRET: env.TURNSTILE_SECRET,
				},
				helpers: {
					verifyTurnstileToken,
					initializeSendGrid,
					sendAdminNotification,
					sendUserConfirmation,
				},
			});
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
