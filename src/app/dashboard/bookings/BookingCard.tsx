"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface BookingCardProps {
  booking: {
    id: string
    date: string
    status: string
    notes?: string | null
    service?: {
      name: string
      durationMinutes: number
      price: number
      mode: string
      location?: string | null
      virtualLink?: string | null
    } | null
    client: { name?: string | null; email?: string | null }
    professional: { name?: string | null; email?: string | null }
    review?: { rating: number; comment?: string | null } | null
  }
  isPro: boolean
  currentUserId: string
}

export default function BookingCard({ booking, isPro, currentUserId }: BookingCardProps) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  const service = booking.service
  const isVirtual = service?.mode === "VIRTUAL"
  const location = isVirtual ? service?.virtualLink : service?.location

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setCancelled(true)
        router.refresh()
      } else {
        alert(data.error || "Error al cancelar")
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setCancelling(false)
    }
  }

  const status = cancelled ? "CANCELLED" : booking.status

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-purple-200">
            {isPro
              ? booking.client.name || "Alumno"
              : booking.professional.name || "Profesional"}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {new Date(booking.date).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {service && (
            <p className="mt-0.5 text-xs text-purple-400/70">
              {service.name} · {service.durationMinutes} min · {isVirtual ? "Virtual" : "Presencial"}
            </p>
          )}
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              status === "CONFIRMED"
                ? "bg-emerald-500/20 text-emerald-300"
                : status === "COMPLETED"
                  ? "bg-blue-500/20 text-blue-300"
                  : status === "CANCELLED"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-yellow-500/20 text-yellow-300"
            }`}
          >
            {status === "CONFIRMED"
              ? "Confirmada"
              : status === "COMPLETED"
                ? "Completada"
                : status === "CANCELLED"
                  ? "Cancelada"
                  : status}
          </span>
          {service && (
            <p className="mt-1 text-sm font-medium text-amber-300">
              {service.price / 100} &euro;
            </p>
          )}
        </div>
      </div>

      {location && status === "CONFIRMED" && (
        <a
          href={location}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-white/5"
        >
          {isVirtual ? "Unirse a la videollamada" : "Ver ubicación"}
        </a>
      )}

      {booking.notes && (
        <p className="mt-3 text-sm text-white/60">
          Notas: {booking.notes}
        </p>
      )}

      {status === "CONFIRMED" && (
        <div className="mt-4 border-t border-white/10 pt-4 flex items-center gap-4">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm font-medium text-red-400/70 hover:text-red-300 disabled:opacity-40"
          >
            {cancelling ? "Cancelando..." : "Cancelar reserva"}
          </button>

          {!isPro && !booking.review && (
            <a
              href={`/bookings/${booking.id}/review`}
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Dejar valoración
            </a>
          )}
        </div>
      )}

      {booking.review && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm text-amber-400">
            {"★".repeat(booking.review.rating)}
            {"☆".repeat(5 - booking.review.rating)}
          </p>
          {booking.review.comment && (
            <p className="mt-1 text-sm text-white/70">
              {booking.review.comment}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
