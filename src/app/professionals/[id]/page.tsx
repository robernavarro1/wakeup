import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatPrice, amazonAffiliateUrl } from "@/lib/utils"

export default async function ProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      professionalProfile: {
        include: {
          services: true,
          availabilities: true,
          bookings: {
            where: { status: "COMPLETED" },
            include: {
              review: true,
              client: true,
            },
          },
          products: {
            where: { active: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!user?.professionalProfile?.published) notFound()

  const profile = user.professionalProfile
  const specialties = profile.specialties
    ? profile.specialties.split(",").map((s) => s.trim())
    : []

  const reviews = profile.bookings
    .filter((b) => b.review)
    .map((b) => b.review!)

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null

  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero section */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-8 shadow-xl shadow-purple-950/40">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/20 text-3xl font-bold text-purple-200 shadow-lg">
              {user.name?.[0] || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.name}
              </h1>
              {profile.title && (
                <p className="mt-1 text-lg text-amber-300/80">{profile.title}</p>
              )}
              {avgRating && (
                <p className="mt-1 text-sm text-amber-400">
                  {"★".repeat(Math.round(avgRating))}
                  {"☆".repeat(5 - Math.round(avgRating))}{" "}
                  <span className="text-purple-300/50">
                    ({reviews.length} valoraciones)
                  </span>
                </p>
              )}
              {profile.city && (
                <p className="mt-1 text-sm text-purple-300/50">📍 {profile.city}</p>
              )}
            </div>
          </div>

          <Link
            href={`/professionals/${id}/book`}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
          >
            Reservar sesión
          </Link>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/60 to-indigo-950/40 p-6 shadow-xl shadow-purple-950/20">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-lg">🕊️</span>
            <h2 className="text-lg font-semibold text-white">Sobre mí</h2>
          </div>
          <p className="text-purple-200/70 whitespace-pre-line leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-purple-950/60 p-6 shadow-xl shadow-amber-950/20">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-lg">🌟</span>
            <h2 className="text-lg font-semibold text-white">Especialidades</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-purple-500/20 bg-purple-950/60 px-4 py-1.5 text-sm font-medium text-purple-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {profile.services.length > 0 && (
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-lg">✨</span>
            <h2 className="text-lg font-semibold text-white">Servicios</h2>
          </div>
          <div className="space-y-3">
            {profile.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-purple-950/40 p-4 transition hover:border-purple-500/20"
              >
                <div>
                  <p className="font-medium text-white">{service.name}</p>
                  <p className="text-sm text-purple-300/50">
                    {service.durationMinutes} min
                  </p>
                </div>
                <p className="text-lg font-semibold text-amber-300">
                  {service.price / 100} €
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {profile.availabilities.length > 0 && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/50 to-purple-950/60 p-6 shadow-xl shadow-emerald-950/20">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-lg">📅</span>
            <h2 className="text-lg font-semibold text-white">Disponibilidad</h2>
          </div>
          <div className="space-y-2">
            {profile.availabilities.map((avail) => (
              <div key={avail.id} className="flex items-center gap-3 text-sm">
                <span className="w-28 rounded-lg border border-white/5 bg-purple-950/40 px-3 py-1.5 font-medium text-purple-200">
                  {DAYS[avail.dayOfWeek]}
                </span>
                <span className="text-purple-300/60">
                  {avail.startTime} - {avail.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {profile.products.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-purple-950/60 p-6 shadow-xl shadow-amber-950/20">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-lg">🛒</span>
            <h2 className="text-lg font-semibold text-white">Productos recomendados</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.products.map((product) => (
              <div key={product.id} className="rounded-xl border border-white/5 bg-purple-950/40 p-4 transition hover:border-amber-500/20">
                <div className="mb-2 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  {product.amazonUrl ? "🛒 Amazon" : "✨ Wakeup"}
                </div>
                {product.image && (
                  <img src={product.image} alt={product.name} className="mb-3 h-32 w-full rounded-lg object-cover" />
                )}
                <h3 className="font-medium text-white text-sm">{product.name}</h3>
                <p className="mt-1 text-xs text-purple-300/50">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-300">
                    {product.price > 0 ? formatPrice(product.price) : ""}
                  </span>
                  {product.amazonUrl ? (
                    <a
                      href={amazonAffiliateUrl(product.amazonUrl)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Comprar
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/60 to-indigo-950/40 p-6 shadow-xl shadow-purple-950/20">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-lg">💬</span>
            <h2 className="text-lg font-semibold text-white">
              Valoraciones ({reviews.length})
            </h2>
          </div>
          <div className="space-y-4">
            {reviews.map((review) => {
              const booking = profile.bookings.find(
                (b) => b.review?.id === review.id
              )
              return (
                <div key={review.id} className="rounded-xl border border-white/5 bg-purple-950/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-purple-200">
                      {booking?.client.name || "Anónimo"}
                    </p>
                    <p className="text-sm text-amber-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-purple-200/60">
                      {review.comment}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
