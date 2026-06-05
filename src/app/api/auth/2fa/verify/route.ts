import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, code, trustDevice } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const validCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!validCode) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
    }

    await prisma.twoFactorCode.update({
      where: { id: validCode.id },
      data: { used: true },
    })

    let trustedToken: string | undefined
    if (trustDevice) {
      trustedToken = crypto.randomBytes(32).toString("hex")
      await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          token: trustedToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    return NextResponse.json({ success: true, verified: true, trustedToken })
  } catch (error) {
    console.error("2FA verify error:", error)
    return NextResponse.json({ error: "Error al verificar" }, { status: 500 })
  }
}
