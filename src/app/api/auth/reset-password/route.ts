import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json()
    if (!token || !email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Token, email y contraseña requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    if (password.length > 128) {
      return NextResponse.json({ error: "La contraseña es demasiado larga" }, { status: 400 })
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

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
