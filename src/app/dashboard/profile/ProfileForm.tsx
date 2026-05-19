"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Availability {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Service {
  id?: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}

interface ProfileData {
  id: string
  title: string | null
  bio: string | null
  phone: string | null
  city: string | null
  pricePerSession: number
  specialties: string
  published: boolean
  services: Service[]
  availabilities: Availability[]
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export function ProfileForm({
  profile,
  userId,
}: {
  profile: ProfileData | null
  userId: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(profile?.title || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [city, setCity] = useState(profile?.city || "")
  const [pricePerSession, setPricePerSession] = useState(
    profile ? String(profile.pricePerSession / 100) : ""
  )
  const [specialties, setSpecialties] = useState(profile?.specialties || "")
  const [services, setServices] = useState<Service[]>(
    profile?.services || [{ name: "", description: "", durationMinutes: 60, price: 0 }]
  )
  const [availabilities, setAvailabilities] = useState<Availability[]>(
    profile?.availabilities || [
      { dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
      { dayOfWeek: 1, startTime: "16:00", endTime: "20:00" },
    ]
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const res = await fetch("/api/professionals/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        bio,
        phone,
        city,
        pricePerSession: Math.round(parseFloat(pricePerSession || "0") * 100),
        specialties,
        services: services.filter((s) => s.name),
        availabilities,
        published: true,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Perfil actualizado correctamente
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Información básica</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título profesional
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ej: Profesor de Yoga y Meditación"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Biografía
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Cuéntales a tus alumnos quién eres..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio por sesión (&euro;)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={pricePerSession}
                onChange={(e) => setPricePerSession(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Especialidades (separadas por coma)
            </label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Yoga, Meditación, Pilates"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Servicios</h2>
        <p className="mt-1 text-sm text-gray-600">
          Define los tipos de sesión que ofreces
        </p>
        {services.map((service, i) => (
          <div key={i} className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={service.name}
                onChange={(e) => {
                  const s = [...services]
                  s[i].name = e.target.value
                  setServices(s)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Sesión individual"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Duración (min)</label>
              <input
                type="number"
                value={service.durationMinutes}
                onChange={(e) => {
                  const s = [...services]
                  s[i].durationMinutes = parseInt(e.target.value)
                  setServices(s)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Precio (&euro;)</label>
              <input
                type="number"
                value={service.price || ""}
                onChange={(e) => {
                  const s = [...services]
                  s[i].price = parseInt(e.target.value)
                  setServices(s)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServices(services.filter((_, j) => j !== i))}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setServices([
              ...services,
              { name: "", description: "", durationMinutes: 60, price: 0 },
            ])
          }
          className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          + Añadir servicio
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Disponibilidad</h2>
        <p className="mt-1 text-sm text-gray-600">
          Define tu horario semanal
        </p>
        {availabilities.map((avail, i) => (
          <div key={i} className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Día</label>
              <select
                value={avail.dayOfWeek}
                onChange={(e) => {
                  const a = [...availabilities]
                  a[i].dayOfWeek = parseInt(e.target.value)
                  setAvailabilities(a)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Desde</label>
              <input
                type="time"
                value={avail.startTime}
                onChange={(e) => {
                  const a = [...availabilities]
                  a[i].startTime = e.target.value
                  setAvailabilities(a)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Hasta</label>
              <input
                type="time"
                value={avail.endTime}
                onChange={(e) => {
                  const a = [...availabilities]
                  a[i].endTime = e.target.value
                  setAvailabilities(a)
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              {availabilities.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setAvailabilities(availabilities.filter((_, j) => j !== i))
                  }
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setAvailabilities([
              ...availabilities,
              { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
            ])
          }
          className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          + Añadir horario
        </button>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar y publicar perfil"}
        </button>
      </div>
    </form>
  )
}
