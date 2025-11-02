import type { Context as HonoContext } from "hono";
import type { ContactFormInput } from "./schemas/contact";

export type CreateContextOptions = {
	context: HonoContext;
	env?: {
		RESEND_API_KEY?: string;
		FROM_EMAIL?: string;
		ADMIN_EMAIL?: string;
		SITE_NAME?: string;
		TURNSTILE_SECRET?: string;
	};
	helpers?: {
		verifyTurnstileToken: (token: string, secret: string) => Promise<boolean>;
		sendAdminNotification: (
			input: ContactFormInput,
			config: {
				fromEmail: string;
				adminEmail: string;
				siteName: string;
			},
			apiKey: string,
		) => Promise<void>;
		sendUserConfirmation: (
			input: ContactFormInput,
			config: {
				fromEmail: string;
				siteName: string;
			},
			apiKey: string,
		) => Promise<void>;
	};
};

export async function createContext({ env, helpers }: CreateContextOptions) {
	// No auth configured
	return {
		session: null,
		env: env || {},
		helpers: helpers as NonNullable<typeof helpers>,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
