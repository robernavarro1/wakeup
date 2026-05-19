import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      professionalProfile: {
        include: {
          bookings: { orderBy: { date: "desc" }, take: 5 },
        },
      },
      clientBookings: {
        include: { professional: true },
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  })

  if (!user) redirect("/auth/login")

  const isPro = user.role === "PROFESSIONAL"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-purple-300/50">
          Bienvenido, {user.name || user.email}
        </p>
      </div>

      <div className="mb-6">
        <Link
          href="/explore"
          className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
        >
          Explorar oferta completa
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isPro && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Perfil profesional</h2>
              {user.professionalProfile?.published ? (
                <p className="mt-2 text-sm text-emerald-400">
                  Tu perfil está publicado
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber-400">
                  Completa tu perfil para publicarlo
                </p>
              )}
              <Link
                href="/dashboard/profile"
                className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Editar perfil &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Próximas reservas</h2>
              {user.professionalProfile?.bookings &&
              user.professionalProfile.bookings.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {user.professionalProfile.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm"
                    >
                      <p>
                        <span className="font-medium text-purple-200">
                          {new Date(booking.date).toLocaleDateString("es-ES")}
                        </span>{" "}
                        <span className="text-purple-300/50">
                          {new Date(booking.date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                      <p className="mt-1 text-purple-300/40">
                        Estado: {booking.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-purple-300/40">
                  No tienes reservas aún
                </p>
              )}
              <Link
                href="/dashboard/bookings"
                className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Ver todas &rarr;
              </Link>
            </div>
          </>
        )}

        {!isPro && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Mis reservas</h2>
            {user.clientBookings.length > 0 ? (
              <div className="mt-4 space-y-3">
                {user.clientBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm"
                  >
                    <p className="font-medium text-purple-200">
                      {new Date(booking.date).toLocaleDateString("es-ES")}
                    </p>
                    <p className="mt-1 text-purple-300/40">
                      Estado: {booking.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-purple-300/40">
                No has hecho ninguna reserva aún
              </p>
            )}
            <Link
              href="/explore"
              className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Explorar profesionales &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
