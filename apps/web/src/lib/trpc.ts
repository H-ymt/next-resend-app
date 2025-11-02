import type { AppRouter } from "@next-resend-app/api/routers/index";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
