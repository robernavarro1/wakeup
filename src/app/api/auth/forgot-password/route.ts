import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getResend } from "@/lib/resend"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ success: true, message: "Si el email existe, recibirás un enlace" })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires: expiresAt },
    })

    const resetUrl = `https://wakeup-app.com/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    try {
      await getResend().emails.send({
        from: "Wakeup <hola@wakeup-app.com>",
        to: email,
        subject: "Restablece tu contraseña — Wakeup",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%">
        <tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr>
        <tr><td style="background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Restablecer contraseña</h1>
          <p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Recibimos una solicitud para restablecer la contraseña de tu cuenta de Wakeup.</p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Restablecer contraseña</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9ca3af">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af">Wakeup — Bienestar holístico para todos</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      })
    } catch (e) { console.log("Email not sent (Resend not configured)", e instanceof Error ? e.message : "") }

    return NextResponse.json({ success: true, message: "Si el email existe, recibirás un enlace" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
