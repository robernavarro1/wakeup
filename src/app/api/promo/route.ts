import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código no válido" }, { status: 400 })
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!promo || !promo.active) {
      return NextResponse.json({ error: "Código no válido o expirado" }, { status: 404 })
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Código agotado" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      freeMonths: promo.freeMonths,
      message: `${promo.freeMonths} meses gratis activados`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al validar código" }, { status: 500 })
  }
}
