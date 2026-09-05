import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      return NextResponse.json({ error: "Token y email requeridos" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const stored = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!stored || stored.identifier.toLowerCase() !== normalizedEmail || stored.expires < new Date()) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({ success: true, message: "Email verificado correctamente" })
  } catch (error) {
    console.error("Verify email error:", error)
    return NextResponse.json({ error: "Error al verificar el email" }, { status: 500 })
  }
}
