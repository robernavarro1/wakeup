import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BookingCard from "./BookingCard"

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientBookings: {
        include: { professional: true, service: true, review: true },
        orderBy: { date: "desc" },
      },
      professionalProfile: {
        include: {
          bookings: {
            include: { client: true, service: true, review: true },
            orderBy: { date: "desc" },
          },
          services: true,
        },
      },
    },
  })

  if (!user) redirect("/auth/login")

  const isPro = user.role === "PROFESSIONAL"
  const proBookings = user.professionalProfile?.bookings || []
  const services = user.professionalProfile?.services || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">
        {isPro ? "Reservas recibidas" : "Mis reservas"}
      </h1>
      <p className="mt-1 text-white/60">
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

      {/* Panel del profesional: capacidad de servicios */}
      {isPro && services.length > 0 && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Capacidad de servicios</h2>
          <div className="space-y-3">
            {services.map((service) => {
              const remaining = service.maxStudents - service.currentStudents
              const isFull = remaining <= 0
              return (
                <div key={service.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="font-medium text-purple-200">{service.name}</p>
                    <p className="text-xs text-white/50">
                      {service.currentStudents}/{service.maxStudents} plazas reservadas
                      {!service.active && " · Inactivo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-red-500" : remaining <= 2 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${(service.currentStudents / service.maxStudents) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isFull ? "text-red-400" : "text-emerald-400"}`}>
                      {isFull ? "Lleno" : `${remaining} libres`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isPro && proBookings.length === 0 ? (
        <p className="mt-16 text-center text-white/50">No hay reservas aún</p>
      ) : !isPro && user.clientBookings.length === 0 ? (
        <p className="mt-16 text-center text-white/50">
          No has hecho ninguna reserva aún
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {(isPro ? proBookings : user.clientBookings).map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking as any}
              isPro={isPro}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
