import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getResend } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.twoFactorCode.create({
      data: { userId: user.id, code, expiresAt },
    })

    try {
      await getResend().emails.send({
        from: "Wakeup <hola@wakeup-app.com>",
        to: email,
        subject: "Tu código de verificación — Wakeup",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%">
          <tr>
            <td align="center" style="padding-bottom:24px">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px">
                    <h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Código de verificación</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px">
                    <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.5">Usa este código para iniciar sesión en tu cuenta de Wakeup. No compartas este código con nadie.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:24px">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:#f5f3ff;border-radius:12px;padding:16px 40px;letter-spacing:8px;font-size:32px;font-weight:700;color:#7c3aed;font-family:monospace">${code}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px">
                    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">Este código expira en 10 minutos.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px">
              <p style="margin:0;font-size:12px;color:#9ca3af">Wakeup — Bienestar holístico para todos</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Si no solicitaste este código, ignora este mensaje.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      })
      return NextResponse.json({ success: true, message: "Código enviado a tu email" })
    } catch (e) { console.log("Email not sent (Resend not configured)", e instanceof Error ? e.message : "") }

    return NextResponse.json({
      success: true,
      message: "Código enviado",
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    })
  } catch (error) {
    console.error("2FA send error:", error)
    return NextResponse.json({ error: "Error al enviar código" }, { status: 500 })
  }
}
