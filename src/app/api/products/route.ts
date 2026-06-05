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
    const product = await prisma.product.create({
      data: {
        profileId: profile.id,
        name: data.name,
        description: data.description,
        price: Math.round(data.price * 100),
        image: data.image,
        amazonUrl: data.amazonUrl,
        category: data.category,
      },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
