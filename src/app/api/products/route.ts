import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { profile: { select: { title: true, user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Products error:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: "Perfil profesional requerido" }, { status: 400 })

  try {
    const data = await request.json()

    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      return NextResponse.json({ error: "Nombre del producto requerido" }, { status: 400 })
    }
    if (data.name.length > 200) {
      return NextResponse.json({ error: "Nombre demasiado largo (máx. 200 caracteres)" }, { status: 400 })
    }
    if (typeof data.price !== "number" || data.price <= 0 || data.price > 100000) {
      return NextResponse.json({ error: "Precio no válido" }, { status: 400 })
    }
    if (data.description && data.description.length > 2000) {
      return NextResponse.json({ error: "Descripción demasiado larga (máx. 2000 caracteres)" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        profileId: profile.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: Math.round(data.price * 100),
        image: data.image || null,
        amazonUrl: data.amazonUrl || null,
        category: data.category || null,
      },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
