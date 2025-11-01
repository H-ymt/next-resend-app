/**
 * Cloudflare Turnstile トークン検証レスポンス
 */
interface TurnstileResponse {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
}

/**
 * Cloudflare Turnstile トークンを検証する
 * @param token - クライアントから送信された Turnstile トークン
 * @param secret - Turnstile Secret Key (環境変数から取得)
 * @returns 検証成功時は true、失敗時は false
 * @throws エラー時は例外をスローする
 */
export async function verifyTurnstileToken(
	token: string,
	secret: string,
): Promise<boolean> {
	try {
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					secret,
					response: token,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`Turnstile API returned ${response.status}: ${response.statusText}`,
			);
		}

		const data = (await response.json()) as TurnstileResponse;

		if (!data.success) {
			console.error("Turnstile verification failed:", data["error-codes"]);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error verifying Turnstile token:", error);
		throw new Error("Turnstile検証中にエラーが発生しました");
	}
}
