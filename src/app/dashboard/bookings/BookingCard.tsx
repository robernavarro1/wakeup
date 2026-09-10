"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CANCEL_REASONS = [
  { value: "cambio_horario", label: "Cambio de horario" },
  { value: "problemas_personales", label: "Problemas personales" },
  { value: "enfermedad", label: "Enfermedad" },
  { value: "ya_no_me_interesa", label: "Ya no me interesa" },
  { value: "encontré_algo_mejor", label: "Encontré algo mejor" },
  { value: "precio", label: "El precio" },
  { value: "mala_comunicación", label: "Mala comunicación" },
  { value: "otro", label: "Otro" },
]

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
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [cancelDetail, setCancelDetail] = useState("")

  const service = booking.service
  const isVirtual = service?.mode === "VIRTUAL"
  const location = isVirtual ? service?.virtualLink : service?.location

  const handleCancel = async () => {
    if (!selectedReason) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: selectedReason, detail: cancelDetail || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setCancelled(true)
        setShowCancelModal(false)
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
    <>
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
          <div className="mt-4 border-t border-white/10 pt-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
            >
              Cancelar reserva
            </button>

            {!isPro && !booking.review && (
              <a
                href={`/bookings/${booking.id}/review`}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 hover:text-purple-200"
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

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1025] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Cancelar reserva</h3>
            <p className="mt-1 text-sm text-white/60">
              Selecciona el motivo de cancelación. Esta información ayuda al profesional a mejorar.
            </p>

            <div className="mt-4 space-y-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    selectedReason === r.value
                      ? "border-purple-500/40 bg-purple-950/80"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={() => setSelectedReason(r.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selectedReason === r.value
                        ? "border-purple-500 bg-purple-500"
                        : "border-white/30"
                    }`}
                  >
                    {selectedReason === r.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-sm text-white/80">{r.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-purple-300/70">
                Detalle (opcional)
              </label>
              <textarea
                value={cancelDetail}
                onChange={(e) => setCancelDetail(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                placeholder="Cuéntanos más si quieres..."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setSelectedReason(""); setCancelDetail("") }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70 hover:bg-white/5"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={!selectedReason || cancelling}
                className="rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cancelling ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
