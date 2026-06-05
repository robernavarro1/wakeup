import { Resend } from "resend"

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
