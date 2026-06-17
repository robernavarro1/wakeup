import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getResend } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const { name, email, password, role, acceptTerms } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: "Debes aceptar los términos y condiciones y la política de privacidad" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes una cuenta con este email. Inicia sesión y ve a Dashboard > Soy profesional para añadir el perfil profesional." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        termsAcceptedAt: new Date(),
      },
    })

    if (user.role === "PROFESSIONAL") {
      await prisma.professionalProfile.create({
        data: { userId: user.id },
      })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires: expiresAt },
    })

    const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

try { await getResend().emails.send({
    from: "Wakeup <hola@wakeup-app.com>",
    to: email,
    subject: "Confirma tu email — Wakeup",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06)">
        <tr><td align="center" style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:40px 20px">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">Wakeup</h1>
        </td></tr>
        <tr><td style="padding:32px 24px">
          <h2 style="margin:0 0 8px;font-size:18px;color:#111827">Confirma tu email</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280">Gracias por registrarte en Wakeup. Confirma tu dirección de email para activar tu cuenta.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">
            <tr><td align="center">
              <a href="${verifyUrl}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Confirmar email</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9ca3af">Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }) } catch (e) { console.log("Email not sent (Resend not configured)", e instanceof Error ? e.message : "") }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    )
  }
}
