import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../index";
import { ContactFormSchema } from "../schemas/contact";

/**
 * お問い合わせフォーム用 tRPC ルーター
 */
export const contactRouter = router({
	/**
	 * お問い合わせフォーム送信
	 */
	send: publicProcedure
		.input(ContactFormSchema)
		.mutation(async ({ input, ctx }) => {
			const { env, helpers } = ctx;

			// 環境変数の検証
			if (
				!env.SENDGRID_API_KEY ||
				!env.FROM_EMAIL ||
				!env.ADMIN_EMAIL ||
				!env.SITE_NAME ||
				!env.TURNSTILE_SECRET
			) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "サーバー設定エラー: 必要な環境変数が設定されていません",
				});
			}

			// ヘルパー関数の検証
			if (
				!helpers.verifyTurnstileToken ||
				!helpers.initializeSendGrid ||
				!helpers.sendAdminNotification ||
				!helpers.sendUserConfirmation
			) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "サーバー設定エラー: 必要なヘルパー関数が設定されていません",
				});
			}

			try {
				// 1. Turnstile 検証
				const isValid = await helpers.verifyTurnstileToken(
					input.turnstileToken,
					env.TURNSTILE_SECRET,
				);

				if (!isValid) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Turnstile認証に失敗しました",
					});
				}

				// 2. SendGrid 初期化
				helpers.initializeSendGrid(env.SENDGRID_API_KEY);

				// 3. 管理者通知メール送信
				await helpers.sendAdminNotification(input, {
					fromEmail: env.FROM_EMAIL,
					adminEmail: env.ADMIN_EMAIL,
					siteName: env.SITE_NAME,
				});

				// 4. ユーザー確認メール送信
				await helpers.sendUserConfirmation(input, {
					fromEmail: env.FROM_EMAIL,
					siteName: env.SITE_NAME,
				});

				return {
					success: true,
					message: "お問い合わせを受け付けました",
				};
			} catch (error) {
				console.error("Contact form error:", error);

				// TRPCError の場合はそのままスロー
				if (error instanceof TRPCError) {
					throw error;
				}

				// その他のエラーは内部サーバーエラーとして処理
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "お問い合わせの送信中にエラーが発生しました",
				});
			}
		}),
});

export type ContactRouter = typeof contactRouter;
