import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const ip = getClientIp(request)
    const { allowed } = checkRateLimit(`check-credentials:${ip}:${normalizedEmail}`, 10, 300000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 5 minutos e inténtalo de nuevo." },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    return NextResponse.json({ success: true, userId: user.id, name: user.name })
  } catch (error) {
    console.error("Check credentials error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
