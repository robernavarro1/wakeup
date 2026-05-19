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

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalId,
        serviceId: selectedService?.id,
        date: date.toISOString(),
        durationMinutes: selectedService?.durationMinutes || 60,
        price,
        notes,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al crear la reserva")
      setLoading(false)
      return
    }

    router.push(`/book/success?bookingId=${data.bookingId}`)
  }

  return (
    <div className="mt-8">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          1
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          2
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          3
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
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
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedService?.id === service.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {service.price / 100} &euro;
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <button
                onClick={() => setStep(2)}
                className={`w-full rounded-lg border p-4 text-left transition hover:border-gray-300`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sesión</p>
                    <p className="text-sm text-gray-500">60 min</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.pricePerSession / 100} &euro;
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
          <h2 className="text-lg font-semibold text-gray-900">
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
                    className={`flex-shrink-0 rounded-lg border p-3 text-center transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs text-gray-500">
                      {DAYS[date.getDay()].slice(0, 3)}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {date.getDate()}
                    </p>
                    <p className="text-xs text-gray-500">
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
                <h3 className="text-sm font-medium text-gray-700">
                  Horarios disponibles
                </h3>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border py-2 text-sm transition ${
                        selectedTime === slot.time
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "hover:border-gray-300"
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
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            3. Confirma tu reserva
          </h2>

          <div className="mt-6 space-y-4 rounded-lg border bg-gray-50 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Servicio</span>
              <span className="font-medium">
                {selectedService?.name || "Sesión"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fecha</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hora</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duración</span>
              <span className="font-medium">
                {selectedService?.durationMinutes || 60} min
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-indigo-600">
                  {price / 100} &euro;
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Incluye tasas de plataforma
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Algo que el profesional deba saber..."
            />
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar y pagar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
