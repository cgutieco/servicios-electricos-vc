import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { contactFormSchema } from '../../lib/schemas';
import { sanitizeText, escapeHtml } from '../../lib/sanitize';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Get environment variables
    const RESEND_API_KEY = ((env as any).RESEND_API_KEY || import.meta.env.RESEND_API_KEY) as string;
    const TURNSTILE_SECRET_KEY = ((env as any).TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY) as string;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY no está configurada.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!TURNSTILE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'TURNSTILE_SECRET_KEY no está configurada.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request JSON payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Formato de solicitud no válido (debe ser JSON).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const turnstileToken = body['cf-turnstile-response'];
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'El CAPTCHA de Turnstile es requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify Turnstile Token
    const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const turnstileResponse = await fetch(turnstileVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const turnstileResult = await turnstileResponse.json() as { success: boolean; 'error-codes'?: string[] };
    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: 'Verificación de CAPTCHA fallida. Por favor, intenta de nuevo.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate body with Zod
    const validatedDataResult = contactFormSchema.safeParse(body);
    if (!validatedDataResult.success) {
      const fieldErrors: Record<string, string> = {};
      validatedDataResult.error.issues.forEach((err: (typeof validatedDataResult.error.issues)[number]) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      return new Response(
        JSON.stringify({ error: 'Error de validación de datos.', fields: fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = validatedDataResult.data;

    // 5. Sanitize fields
    const cleanName = sanitizeText(data.name);
    const cleanCondominio = sanitizeText(data.condominio);
    const cleanPhone = sanitizeText(data.phone);
    const cleanService = sanitizeText(data.service);

    // Escape variables for secure HTML injection
    const escName = escapeHtml(cleanName);
    const escCondominio = escapeHtml(cleanCondominio);
    const escPhone = escapeHtml(cleanPhone);
    const escService = escapeHtml(cleanService).replace(/\n/g, '<br />');

    // 6. Send email via Resend
    const resend = new Resend(RESEND_API_KEY);

    // Configurable sender and recipient
    const sender = (env as any).SENDER_EMAIL || import.meta.env.SENDER_EMAIL || 'contacto@cgutieco.com';
    const recipient = (env as any).RECIPIENT_EMAIL || import.meta.env.RECIPIENT_EMAIL || 'contacto@cgutieco.com';

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `Formulario Contacto <${sender}>`,
      to: recipient,
      subject: `Nueva Solicitud de Evaluación: ${cleanCondominio}`,
      replyTo: cleanName ? `${cleanName} <${sender}>` : undefined,
      text: `Nueva solicitud recibida de Servicios Eléctricos VC:\n\n` +
            `Nombre: ${cleanName}\n` +
            `Condominio: ${cleanCondominio}\n` +
            `Teléfono: ${cleanPhone}\n` +
            `Servicio Requerido:\n${cleanService}\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 10px;">Nueva Solicitud de Evaluación</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555; width: 150px;">Nombre:</td>
              <td style="padding: 8px 0; color: #222;">${escName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Condominio:</td>
              <td style="padding: 8px 0; color: #222;">${escCondominio}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Teléfono:</td>
              <td style="padding: 8px 0; color: #222;"><a href="tel:${cleanPhone}" style="color: #0f3460; text-decoration: none;">${escPhone}</a></td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #0f3460;">
            <strong style="color: #555; display: block; margin-bottom: 8px;">Servicio Requerido:</strong>
            <p style="margin: 0; color: #222; white-space: pre-wrap; line-height: 1.5;">${escService}</p>
          </div>
          <footer style="margin-top: 25px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 10px;">
            Este correo fue enviado automáticamente desde el formulario de contacto de reparaciones-electricas-vc.cgutieco.com.
          </footer>
        </div>
      `,
    });

    if (resendError) {
      console.error('Error de Resend:', resendError);
      return new Response(
        JSON.stringify({ error: 'Error al enviar el correo a través de Resend.', details: resendError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Solicitud enviada exitosamente.', data: resendData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en API send-email:', error);
    return new Response(
      JSON.stringify({ error: 'Ha ocurrido un error interno en el servidor.', details: error?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
