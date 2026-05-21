import { prisma } from "@/lib/prisma"
import { formatPrice, amazonAffiliateUrl } from "@/lib/utils"
import { AddToCartButton } from "./AddToCartButton"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { profile: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  const amazonProducts = products.filter((p) => p.amazonUrl)
  const localProducts = products.filter((p) => !p.amazonUrl)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Productos</h1>
        <p className="mt-2 text-purple-300/50">Herramientas para tu despertar</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-purple-300/30">No hay productos disponibles</p>
      ) : (
        <div className="space-y-12">
          {/* Amazon products */}
          {amazonProducts.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-lg">🛒</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Recomendados en Amazon</h2>
                  <p className="text-sm text-purple-300/50">Compra directa desde Amazon — envío rápido y seguro</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {amazonProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-purple-950/40 p-6 shadow-lg shadow-amber-950/20 transition hover:border-amber-500/40"
                  >
                    <div className="mb-3 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                      🛒 Amazon
                    </div>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="mb-4 h-48 w-full rounded-xl object-cover" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="mt-1 text-sm text-purple-300/50">{product.description}</p>
                    <p className="mt-2 text-sm text-purple-300/30">
                      por {product.profile.user.name}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-300">
                        {product.price > 0 ? formatPrice(product.price) : "Precio en Amazon"}
                      </span>
                      <a
                        href={amazonAffiliateUrl(product.amazonUrl!)}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition hover:shadow-amber-600/40"
                      >
                        Comprar en Amazon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Local products */}
          {localProducts.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-lg">✨</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Productos de profesionales</h2>
                  <p className="text-sm text-purple-300/50">Creados por los profesionales de nuestra comunidad</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {localProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition hover:border-purple-500/30"
                  >
                    {product.image && (
                      <img src={product.image} alt={product.name} className="mb-4 h-48 w-full rounded-xl object-cover" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="mt-1 text-sm text-purple-300/50">{product.description}</p>
                    <p className="mt-2 text-sm text-purple-300/30">
                      por {product.profile.user.name}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-200">
                        {formatPrice(product.price)}
                      </span>
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
