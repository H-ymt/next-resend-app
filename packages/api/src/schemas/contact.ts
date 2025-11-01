import { z } from "zod";

/**
 * お問い合わせフォームのバリデーションスキーマ
 */
export const ContactFormSchema = z.object({
	name: z
		.string()
		.min(1, "名前を入力してください")
		.max(100, "名前は100文字以内で入力してください"),
	email: z
		.string()
		.min(1, "メールアドレスを入力してください")
		.email("正しいメールアドレスを入力してください")
		.max(255, "メールアドレスは255文字以内で入力してください"),
	message: z
		.string()
		.min(10, "お問い合わせ内容は10文字以上で入力してください")
		.max(5000, "お問い合わせ内容は5000文字以内で入力してください"),
	turnstileToken: z.string().min(1, "Turnstile認証が完了していません"),
});

/**
 * お問い合わせフォームの型定義
 */
export type ContactFormInput = z.infer<typeof ContactFormSchema>;
