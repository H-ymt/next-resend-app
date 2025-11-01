"use client";

import { useEffect, useRef } from "react";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: string | HTMLElement,
				params: {
					sitekey: string;
					callback?: (token: string) => void;
					"error-callback"?: () => void;
					theme?: "light" | "dark" | "auto";
					size?: "normal" | "compact";
				},
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

export interface TurnstileProps {
	siteKey: string;
	onVerify: (token: string) => void;
	onError?: () => void;
	theme?: "light" | "dark" | "auto";
	size?: "normal" | "compact";
}

export function Turnstile({
	siteKey,
	onVerify,
	onError,
	theme = "auto",
	size = "normal",
}: TurnstileProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	useEffect(() => {
		const renderTurnstile = () => {
			if (!containerRef.current || !window.turnstile) return;

			// 既にレンダリング済みの場合はスキップ
			if (widgetIdRef.current) return;

			widgetIdRef.current = window.turnstile.render(containerRef.current, {
				sitekey: siteKey,
				callback: onVerify,
				"error-callback": onError,
				theme,
				size,
			});
		};

		// Turnstile スクリプトが既にロード済みかチェック
		if (window.turnstile) {
			renderTurnstile();
			return;
		}

		// Turnstile スクリプトを動的に読み込む
		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			renderTurnstile();
		};

		document.head.appendChild(script);

		// クリーンアップ
		return () => {
			if (widgetIdRef.current && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
			}
		};
	}, [siteKey, onVerify, onError, theme, size]);

	return <div ref={containerRef} />;
}
