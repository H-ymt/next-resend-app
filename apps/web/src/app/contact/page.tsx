"use client";

import { ContactFormSchema } from "@next-sendgrid-app/api/schemas/contact";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export default function ContactPage() {
	const [turnstileToken, setTurnstileToken] = useState<string>("");
	const contactMutation = trpc.contact.send.useMutation();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			message: "",
		},
		onSubmit: async ({ value }) => {
			if (!turnstileToken) {
				toast.error("Turnstile認証が完了していません");
				return;
			}

			try {
				const result = await contactMutation.mutateAsync({
					...value,
					turnstileToken,
				});

				toast.success(result.message);

				// フォームをリセット
				form.reset();
				setTurnstileToken("");
			} catch (error) {
				console.error("Contact form error:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "お問い合わせの送信中にエラーが発生しました",
				);
			}
		},
	});

	return (
		<div className="container mx-auto max-w-2xl px-4 py-12">
			<h1 className="mb-8 font-bold text-3xl">お問い合わせ</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* 名前 */}
				<form.Field
					name="name"
					validators={{
						onChangeAsync: async ({ value }) => {
							const result = ContactFormSchema.shape.name.safeParse(value);
							if (!result.success) {
								return result.error.issues[0]?.message || "入力エラー";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="name">お名前 *</Label>
							<Input
								id="name"
								type="text"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="山田 太郎"
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-sm">
									{String(field.state.meta.errors[0])}
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* メールアドレス */}
				<form.Field
					name="email"
					validators={{
						onChangeAsync: async ({ value }) => {
							const result = ContactFormSchema.shape.email.safeParse(value);
							if (!result.success) {
								return result.error.issues[0]?.message || "入力エラー";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="email">メールアドレス *</Label>
							<Input
								id="email"
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="example@example.com"
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-sm">
									{String(field.state.meta.errors[0])}
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* お問い合わせ内容 */}
				<form.Field
					name="message"
					validators={{
						onChangeAsync: async ({ value }) => {
							const result = ContactFormSchema.shape.message.safeParse(value);
							if (!result.success) {
								return result.error.issues[0]?.message || "入力エラー";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="message">お問い合わせ内容 *</Label>
							<Textarea
								id="message"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="お問い合わせ内容を入力してください（10文字以上）"
								rows={6}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-sm">
									{String(field.state.meta.errors[0])}
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Turnstile */}
				<div className="space-y-2">
					<Label>スパム対策認証 *</Label>
					<Turnstile
						siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
						onVerify={(token) => setTurnstileToken(token)}
						onError={() => {
							setTurnstileToken("");
							toast.error("Turnstile認証に失敗しました");
						}}
					/>
					{!turnstileToken && (
						<p className="text-muted-foreground text-sm">
							送信前にスパム対策認証を完了してください
						</p>
					)}
				</div>

				{/* 送信ボタン */}
				<Button
					type="submit"
					disabled={contactMutation.isPending || !turnstileToken}
					className="w-full"
				>
					{contactMutation.isPending ? "送信中..." : "送信する"}
				</Button>
			</form>
		</div>
	);
}
