"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { queryClient, trpcClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [trpcClientState] = useState(() => trpcClient);
	const [queryClientState] = useState(() => queryClient);

	return (
		<trpc.Provider client={trpcClientState} queryClient={queryClientState}>
			<QueryClientProvider client={queryClientState}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<ReactQueryDevtools />
					<Toaster richColors />
				</ThemeProvider>
			</QueryClientProvider>
		</trpc.Provider>
	);
}
