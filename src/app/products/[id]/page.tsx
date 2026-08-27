import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, amazonAffiliateUrl } from "@/lib/utils"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { AddToCartButton } from "../AddToCartButton"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true },
  })
  if (!product) return { title: "Producto no encontrado — Wakeup" }
  return {
    title: `${product.name} — Wakeup`,
    description: product.description || `Compra ${product.name} en Wakeup`,
    openGraph: { title: product.name, description: product.description || "" },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      profile: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!product) notFound()

  const isAmazon = !!product.amazonUrl

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-purple-300/50 hover:text-purple-200"
      >
        &larr; Volver a la tienda
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {product.image && (
            <div className="overflow-hidden rounded-xl">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            {isAmazon && (
              <div className="mb-3 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                🛒 Amazon
              </div>
            )}
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-purple-300/50">
              por {product.profile.user.name}
            </p>
            {product.category && (
              <p className="mt-2 text-xs text-purple-300/40">
                Categoría: {product.category}
              </p>
            )}
            <div className="mt-4">
              <span className="text-3xl font-bold text-amber-300">
                {product.price > 0 ? formatPrice(product.price) : "Ver en Amazon"}
              </span>
            </div>
            {product.description && (
              <p className="mt-6 leading-relaxed text-purple-200/70">
                {product.description}
              </p>
            )}
            <div className="mt-8">
              {isAmazon ? (
                <a
                  href={amazonAffiliateUrl(product.amazonUrl!)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/25 transition hover:shadow-amber-600/40"
                >
                  Comprar en Amazon
                  <span>→</span>
                </a>
              ) : (
                <AddToCartButton productId={product.id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {product.amazonUrl && (
        <div className="mt-6 rounded-xl border border-amber-500/10 bg-amber-950/20 p-4 text-center text-xs text-amber-300/50">
          Este enlace es un enlace de afiliado de Amazon. Wakeup recibe una pequeña comisión sin costo adicional para ti.
        </div>
      )}
    </div>
  )
}
