import type { ContactFormInput } from "@next-sendgrid-app/api/schemas/contact";
import sendgrid from "@sendgrid/mail";

/**
 * SendGrid API を初期化
 */
export function initializeSendGrid(apiKey: string): void {
	sendgrid.setApiKey(apiKey);
}

/**
 * 管理者宛に通知メールを送信
 * @param input - お問い合わせフォームの入力データ
 * @param config - 送信設定
 */
export async function sendAdminNotification(
	input: ContactFormInput,
	config: {
		fromEmail: string;
		adminEmail: string;
		siteName: string;
	},
): Promise<void> {
	const { name, email, message } = input;
	const { fromEmail, adminEmail, siteName } = config;

	const mailContent = {
		to: adminEmail,
		from: fromEmail,
		subject: `【${siteName}】お問い合わせがありました`,
		text: `
新しいお問い合わせがありました。

■ お名前
${name}

■ メールアドレス
${email}

■ お問い合わせ内容
${message}

---
このメールは ${siteName} のお問い合わせフォームから自動送信されています。
		`.trim(),
		html: `
<html>
<body style="font-family: sans-serif; line-height: 1.6;">
	<h2 style="color: #333;">新しいお問い合わせがありました</h2>

	<div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
		<h3 style="margin-top: 0; color: #555;">■ お名前</h3>
		<p style="margin: 5px 0;">${name}</p>

		<h3 style="color: #555;">■ メールアドレス</h3>
		<p style="margin: 5px 0;"><a href="mailto:${email}">${email}</a></p>

		<h3 style="color: #555;">■ お問い合わせ内容</h3>
		<p style="margin: 5px 0; white-space: pre-wrap;">${message}</p>
	</div>

	<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
	<p style="color: #888; font-size: 12px;">
		このメールは ${siteName} のお問い合わせフォームから自動送信されています。
	</p>
</body>
</html>
		`.trim(),
	};

	try {
		await sendgrid.send(mailContent);
	} catch (error) {
		console.error("Failed to send admin notification:", error);
		throw new Error("管理者への通知メール送信に失敗しました");
	}
}

/**
 * ユーザー宛に自動返信メールを送信
 * @param input - お問い合わせフォームの入力データ
 * @param config - 送信設定
 */
export async function sendUserConfirmation(
	input: ContactFormInput,
	config: {
		fromEmail: string;
		siteName: string;
	},
): Promise<void> {
	const { name, email } = input;
	const { fromEmail, siteName } = config;

	const mailContent = {
		to: email,
		from: fromEmail,
		subject: `【${siteName}】お問い合わせを受け付けました`,
		text: `
${name} 様

お問い合わせいただきありがとうございます。

お問い合わせ内容を確認次第、担当者よりご連絡いたします。
今しばらくお待ちください。

---
${siteName}
このメールは自動送信されています。このメールに返信しないでください。
		`.trim(),
		html: `
<html>
<body style="font-family: sans-serif; line-height: 1.6;">
	<p>${name} 様</p>

	<p>お問い合わせいただきありがとうございます。</p>

	<p>お問い合わせ内容を確認次第、担当者よりご連絡いたします。<br>
	今しばらくお待ちください。</p>

	<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
	<p style="color: #888; font-size: 12px;">
		${siteName}<br>
		このメールは自動送信されています。このメールに返信しないでください。
	</p>
</body>
</html>
		`.trim(),
	};

	try {
		await sendgrid.send(mailContent);
	} catch (error) {
		console.error("Failed to send user confirmation:", error);
		throw new Error("確認メール送信に失敗しました");
	}
}
