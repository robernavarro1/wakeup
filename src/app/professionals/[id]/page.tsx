import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

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
      <div className="rounded-2xl border bg-white p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
              {user.name?.[0] || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h1>
              {profile.title && (
                <p className="mt-1 text-lg text-gray-600">{profile.title}</p>
              )}
              {avgRating && (
                <p className="mt-1 text-sm text-amber-500">
                  {"★".repeat(Math.round(avgRating))}
                  {"☆".repeat(5 - Math.round(avgRating))}{" "}
                  <span className="text-gray-500">
                    ({reviews.length} valoraciones)
                  </span>
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/professionals/${id}/book`}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Reservar sesión
          </Link>
        </div>

        {profile.bio && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Sobre mí</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Especialidades
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.services.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Servicios</h2>
            <div className="mt-4 space-y-3">
              {profile.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.price / 100} &euro;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.availabilities.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Disponibilidad
            </h2>
            <div className="mt-3 space-y-2">
              {profile.availabilities.map((avail) => (
                <div key={avail.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-24 font-medium">
                    {DAYS[avail.dayOfWeek]}
                  </span>
                  <span>
                    {avail.startTime} - {avail.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.city && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
            <p className="mt-1 text-gray-600">{profile.city}</p>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Valoraciones ({reviews.length})
            </h2>
            <div className="mt-4 space-y-4">
              {reviews.map((review) => {
                const booking = profile.bookings.find(
                  (b) => b.review?.id === review.id
                )
                return (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {booking?.client.name || "Anónimo"}
                      </p>
                      <p className="text-sm text-amber-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600">
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
    </div>
  )
}
