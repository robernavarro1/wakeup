import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CartContent } from "./CartContent"

export default async function CartPage() {
  const session = await auth()
  let items: any[] = []

  if (session?.user) {
    items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { profile: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
    })
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Carrito</h1>
          <p className="mt-1 text-sm text-purple-300/50">
            {itemCount > 0
              ? `${itemCount} producto${itemCount > 1 ? "s" : ""} en tu carrito`
              : "Tu carrito está vacío"}
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70 transition hover:bg-white/5 hover:text-purple-200"
        >
          Seguir comprando
        </Link>
      </div>

      {itemCount > 0 ? (
        <CartContent items={items} total={items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24">
          <svg className="mb-4 h-16 w-16 text-purple-300/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="text-xl font-semibold text-purple-300/70">Tu carrito está vacío</h2>
          <p className="mt-2 text-sm text-purple-300/40">Explora nuestros productos y añade los que más te gusten</p>
          <Link
            href="/products"
            className="mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
          >
            Ir a la tienda
          </Link>
        </div>
      )}
    </div>
  )
}
