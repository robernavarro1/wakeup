"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Profile {
  pricePerSession: number
  services: Service[]
  availabilities: Availability[]
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function getNextAvailableDates(availabilities: Availability[]): Date[] {
  const dates: Date[] = []
  const today = new Date()

  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayAvail = availabilities.filter((a) => a.dayOfWeek === date.getDay())
    if (dayAvail.length > 0) {
      dates.push(date)
    }
  }

  return dates
}

function generateTimeSlots(
  date: Date,
  availabilities: Availability[]
): { time: string; available: boolean }[] {
  const dayAvail = availabilities.filter(
    (a) => a.dayOfWeek === date.getDay()
  )

  const slots: { time: string; available: boolean }[] = []
  for (const avail of dayAvail) {
    const [startH, startM] = avail.startTime.split(":").map(Number)
    const [endH, endM] = avail.endTime.split(":").map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    for (let m = startMinutes; m < endMinutes; m += 60) {
      const h = Math.floor(m / 60)
      const min = m % 60
      const time = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      slots.push({ time, available: true })
    }
  }

  return slots
}

export function BookingForm({
  professionalId,
  profile,
}: {
  professionalId: string
  profile: Profile
}) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedService, setSelectedService] = useState<Service | null>(
    profile.services.length === 1 ? profile.services[0] : null
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const availableDates = getNextAvailableDates(profile.availabilities)
  const timeSlots = selectedDate
    ? generateTimeSlots(selectedDate, profile.availabilities)
    : []

  const price = selectedService?.price || profile.pricePerSession

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return
    setLoading(true)
    setError("")

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const date = new Date(selectedDate)
    date.setHours(hours, minutes, 0, 0)

    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalId,
        serviceId: selectedService?.id,
        date: date.toISOString(),
        durationMinutes: selectedService?.durationMinutes || 60,
        price,
        notes,
        type: "booking",
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al procesar el pago")
      setLoading(false)
      return
    }

    window.open(data.url, "_blank")
  }

  return (
    <div className="mt-8">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                step >= s
                  ? "bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-lg shadow-purple-600/25"
                  : "border border-white/10 bg-purple-950/40 text-purple-300/50"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`h-px flex-1 ${step > s ? "bg-purple-500/30" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">
            1. Selecciona un servicio
          </h2>
          <div className="mt-4 space-y-3">
            {profile.services.length > 0 ? (
              profile.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setStep(2)
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedService?.id === service.id
                      ? "border-purple-500/40 bg-purple-950/80"
                      : "border-white/5 bg-purple-950/40 hover:border-purple-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {service.name}
                      </p>
                      <p className="text-sm text-purple-300/50">
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-amber-300">
                      {service.price / 100} €
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <button
                onClick={() => setStep(2)}
                className={`w-full rounded-xl border border-white/5 bg-purple-950/40 p-4 text-left transition hover:border-purple-500/20`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Sesión</p>
                    <p className="text-sm text-purple-300/50">60 min</p>
                  </div>
                  <p className="text-lg font-semibold text-amber-300">
                    {profile.pricePerSession / 100} €
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">
            2. Elige fecha y hora
          </h2>
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates.map((date) => {
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString()
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedTime(null)
                    }}
                    className={`flex-shrink-0 rounded-xl border p-3 text-center transition ${
                      isSelected
                        ? "border-purple-500/40 bg-purple-950/80 shadow-lg shadow-purple-500/20"
                        : "border-white/5 bg-purple-950/40 hover:border-purple-500/20"
                    }`}
                  >
                    <p className="text-xs text-purple-300/50">
                      {DAYS[date.getDay()].slice(0, 3)}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {date.getDate()}
                    </p>
                    <p className="text-xs text-purple-300/50">
                      {date.toLocaleDateString("es-ES", {
                        month: "short",
                      })}
                    </p>
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-purple-300/70">
                  Horarios disponibles
                </h3>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-xl border py-2 text-sm transition ${
                        selectedTime === slot.time
                          ? "border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-lg shadow-amber-500/20"
                          : "border-white/5 bg-purple-950/40 text-purple-300/70 hover:border-purple-500/20"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70 hover:bg-white/5"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">
            3. Confirma tu reserva
          </h2>

          <div className="mt-6 space-y-4 rounded-xl border border-white/5 bg-purple-950/40 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300/50">Servicio</span>
              <span className="font-medium text-white">
                {selectedService?.name || "Sesión"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300/50">Fecha</span>
              <span className="font-medium text-white">
                {selectedDate?.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300/50">Hora</span>
              <span className="font-medium text-white">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300/50">Duración</span>
              <span className="font-medium text-white">
                {selectedService?.durationMinutes || 60} min
              </span>
            </div>
            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-amber-300">
                  {price / 100} €
                </span>
              </div>
              <p className="mt-1 text-xs text-purple-300/40">
                Incluye tasas de plataforma
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-purple-300/70">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Algo que el profesional deba saber..."
            />
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70 hover:bg-white/5"
            >
              Atrás
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar y pagar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
