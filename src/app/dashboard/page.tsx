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
          subscription: true,
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

  const hasProProfile = !!user.professionalProfile
  const isBosque = user.professionalProfile?.subscription?.plan === "BOSQUE" && (user.professionalProfile?.subscription?.status === "ACTIVE" || user.professionalProfile?.subscription?.status === "TRIALING")
  // Número de soporte VIP. Se puede sobreescribir con NEXT_PUBLIC_VIP_WHATSAPP.
  const vipWhatsapp = (process.env.NEXT_PUBLIC_VIP_WHATSAPP || "34608818215").replace(/\D/g, "")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-purple-300/50">
          Bienvenido, {user.name || user.email}
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <Link
          href="/explore"
          className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
        >
          Explorar oferta completa
        </Link>
        {!hasProProfile && (
          <Link
            href="/dashboard/profile"
            className="inline-block rounded-lg border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-300 hover:bg-purple-500/10"
          >
            Soy profesional &rarr;
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hasProProfile && (
          <>
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
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

            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-purple-950/60 p-6 shadow-xl shadow-amber-950/20">
              <h2 className="text-lg font-semibold text-white">Próximas reservas (como profesional)</h2>
              {user.professionalProfile?.bookings &&
              user.professionalProfile.bookings.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {user.professionalProfile.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border-white/5 bg-purple-950/40 p-3 text-sm"
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
                  No tienes reservas como profesional aún
                </p>
              )}
              <Link
                href="/dashboard/bookings"
                className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Ver todas &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
              <h2 className="text-lg font-semibold text-white">Mis productos</h2>
              <p className="mt-2 text-sm text-purple-300/50">
                Gestiona los productos que vendes en Wakeup. Añade artículos, edita precios y
                recibe pagos directamente a tu cuenta de Stripe.
              </p>
              <Link
                href="/dashboard/products"
                className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Gestionar productos &rarr;
              </Link>
            </div>
          </>
        )}

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/50 to-purple-950/60 p-6 shadow-xl shadow-emerald-950/20">
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

        {!hasProProfile && (
          <div className="rounded-2xl border border-dashed border-purple-500/30 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
            <h2 className="text-lg font-semibold text-white">¿Eres profesional?</h2>
            <p className="mt-2 text-sm text-purple-300/50">
              Da el salto: crea tu perfil, ofrece tus servicios y empieza a recibir clientes. Puedes tener una misma cuenta para explorar y para ofrecer sesiones.
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
            >
              Crear perfil profesional
            </Link>
          </div>
        )}
      </div>

      {isBosque && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 to-purple-950/60 p-6 shadow-xl shadow-amber-950/30">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/40 to-amber-600/20 text-2xl shadow-lg">👑</span>
            <div>
              <h2 className="text-lg font-bold text-white">Soporte VIP 24/7</h2>
              <p className="text-sm text-amber-300/60">Plan Bosque — acceso prioritario ilimitado</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {vipWhatsapp && (
              <a
                href={`https://wa.me/${vipWhatsapp}?text=Hola%2C%20soy%20usuario%20VIP%20de%20Wakeup%20y%20necesito%20ayuda`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp VIP
              </a>
            )}
            <a
              href="mailto:hola@wakeup-app.com?subject=Soporte%20VIP%20-%20Wakeup&body=Hola%2C%20soy%20usuario%20VIP%20de%20Wakeup%20y%20necesito%20ayuda%3A"
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10"
            >
              ✉ Email soporte
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
