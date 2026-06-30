/// <reference path="../.astro/types.d.ts" />

declare module 'cloudflare:workers' {
	export const env: {
		RESEND_API_KEY?: string;
		TURNSTILE_SECRET_KEY?: string;
		SENDER_EMAIL?: string;
		RECIPIENT_EMAIL?: string;
		[key: string]: any;
	};
}
