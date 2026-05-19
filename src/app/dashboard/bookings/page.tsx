import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientBookings: {
        include: { professional: true, review: true },
        orderBy: { date: "desc" },
      },
      professionalProfile: {
        include: {
          bookings: {
            include: { client: true, review: true },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  })

  if (!user) redirect("/auth/login")

  const isPro = user.role === "PROFESSIONAL"
  const proBookings = user.professionalProfile?.bookings || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">
        {isPro ? "Reservas recibidas" : "Mis reservas"}
      </h1>
      <p className="mt-1 text-purple-300/50">
        {isPro
          ? "Tus próximas sesiones con alumnos"
          : "Tus sesiones reservadas"}
      </p>

      <div className="mb-6 mt-4">
        <a
          href="/explore"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          &larr; Volver a explorar
        </a>
      </div>

      {isPro && proBookings.length === 0 ? (
        <p className="mt-16 text-center text-purple-300/40">No hay reservas aún</p>
      ) : !isPro && user.clientBookings.length === 0 ? (
        <p className="mt-16 text-center text-purple-300/40">
          No has hecho ninguna reserva aún
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {(isPro ? proBookings : user.clientBookings).map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-purple-200">
                    {isPro
                      ? (booking as typeof proBookings[number]).client.name ||
                        "Alumno"
                      : (
                          booking as (typeof user.clientBookings)[number]
                        ).professional.name || "Profesional"}
                  </p>
                  <p className="mt-1 text-sm text-purple-300/50">
                    {new Date(booking.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      booking.status === "CONFIRMED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : booking.status === "COMPLETED"
                          ? "bg-blue-500/20 text-blue-300"
                          : booking.status === "CANCELLED"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {booking.status === "CONFIRMED"
                      ? "Confirmada"
                      : booking.status === "COMPLETED"
                        ? "Completada"
                        : booking.status === "CANCELLED"
                          ? "Cancelada"
                          : booking.status}
                  </span>
                  <p className="mt-1 text-sm font-medium text-amber-300">
                    {booking.price / 100} &euro;
                  </p>
                </div>
              </div>

              {(booking as any).zoomLink && booking.status === "CONFIRMED" && (
                <a
                  href={(booking as any).zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-white/5"
                >
                  Unirse a la videollamada
                </a>
              )}

              {(booking as any).notes && (
                <p className="mt-3 text-sm text-purple-300/50">
                  Notas: {(booking as any).notes}
                </p>
              )}

              {booking.status === "CONFIRMED" && !isPro && !booking.review && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-purple-300/60">
                    ¿Cómo fue tu experiencia?
                  </p>
                  <a
                    href={`/bookings/${booking.id}/review`}
                    className="mt-2 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
                  >
                    Dejar valoración
                  </a>
                </div>
              )}

              {booking.review && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-amber-400">
                    {"★".repeat(booking.review.rating)}
                    {"☆".repeat(5 - booking.review.rating)}
                  </p>
                  {booking.review.comment && (
                    <p className="mt-1 text-sm text-purple-300/60">
                      {booking.review.comment}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
