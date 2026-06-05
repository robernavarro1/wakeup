import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { profile: true },
  })
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  if (product.profile.userId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  try {
    const data = await request.json()
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name ?? product.name,
        description: data.description ?? product.description,
        price: data.price ? Math.round(data.price * 100) : product.price,
        image: data.image ?? product.image,
        category: data.category ?? product.category,
        active: data.active ?? product.active,
      },
    })
    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { profile: true },
  })
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  if (product.profile.userId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
