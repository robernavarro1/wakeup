import { Resend } from "resend"

/**
 * Remitente de todos los emails que envía la plataforma.
 *
 * El dominio wakeup-app.com está verificado en Resend (registros DKIM y SPF
 * en send.wakeup-app.com), así que podemos enviar desde nuestra propia marca.
 * Se puede sobreescribir con RESEND_FROM sin tocar el código.
 *
 * Importante: NO usar onboarding@resend.dev como alternativa. Esa dirección
 * de pruebas de Resend solo permite enviar al email del titular de la cuenta,
 * por lo que los correos a los clientes se descartarían en silencio.
 */
export const MAIL_FROM = process.env.RESEND_FROM || "Wakeup <hola@wakeup-app.com>"

function createResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key || key === "re_placeholder") {
    throw new Error("RESEND_API_KEY not configured")
  }
  return new Resend(key)
}

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) _resend = createResend()
  return _resend
}
