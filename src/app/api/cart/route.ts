import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return NextResponse.json({ items, total })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { productId, quantity = 1 } = await request.json()
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    })

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { userId: session.user.id, productId, quantity },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart error:", error)
    return NextResponse.json({ error: "Error al agregar al carrito" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { productId } = await request.json()
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, productId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
