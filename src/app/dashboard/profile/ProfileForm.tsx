"use client"

import { useState, useEffect } from "react"
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
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/60 p-4 text-sm text-emerald-300">
          ✨ Perfil actualizado correctamente
        </div>
      )}

      {/* Información básica */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 text-xl shadow-lg shadow-purple-500/20">🕊️</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Información básica</h2>
            <p className="text-sm text-purple-300/50">Preséntate a la comunidad</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-300/70">Título profesional</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Ej: Profesor de Yoga y Meditación"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Cuéntales a tus alumnos quién eres y qué ofreces..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-purple-300/70">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300/70">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300/70">Precio por sesión (€)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={pricePerSession}
                onChange={(e) => setPricePerSession(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Especialidades</label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Yoga, Meditación, Pilates (separadas por coma)"
            />
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-purple-950/60 p-6 shadow-xl shadow-amber-950/20">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 text-xl shadow-lg shadow-amber-500/20">🌟</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Servicios</h2>
            <p className="text-sm text-purple-300/50">Define los tipos de sesión que ofreces</p>
          </div>
        </div>
        <div className="space-y-4">
          {services.map((service, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-purple-950/40 p-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-purple-300/50">Nombre</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => {
                      const s = [...services]
                      s[i].name = e.target.value
                      setServices(s)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                    placeholder="Sesión individual de yoga"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Duración (min)</label>
                  <input
                    type="number"
                    value={service.durationMinutes}
                    onChange={(e) => {
                      const s = [...services]
                      s[i].durationMinutes = parseInt(e.target.value)
                      setServices(s)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Precio (€)</label>
                  <input
                    type="number"
                    value={service.price || ""}
                    onChange={(e) => {
                      const s = [...services]
                      s[i].price = parseInt(e.target.value)
                      setServices(s)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                  />
                </div>
              </div>
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServices(services.filter((_, j) => j !== i))}
                  className="mt-3 text-sm text-red-400/70 hover:text-red-300"
                >
                  Eliminar servicio
                </button>
              )}
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
            className="flex items-center gap-2 text-sm font-medium text-amber-400/70 hover:text-amber-300"
          >
            + Añadir servicio
          </button>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/50 to-purple-950/60 p-6 shadow-xl shadow-emerald-950/20">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-xl shadow-lg shadow-emerald-500/20">📅</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Disponibilidad</h2>
            <p className="text-sm text-purple-300/50">Define tu horario semanal</p>
          </div>
        </div>
        <div className="space-y-4">
          {availabilities.map((avail, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-purple-950/40 p-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Día</label>
                  <select
                    value={avail.dayOfWeek}
                    onChange={(e) => {
                      const a = [...availabilities]
                      a[i].dayOfWeek = parseInt(e.target.value)
                      setAvailabilities(a)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx} className="bg-[#0a0515] text-white">{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Desde</label>
                  <input
                    type="time"
                    value={avail.startTime}
                    onChange={(e) => {
                      const a = [...availabilities]
                      a[i].startTime = e.target.value
                      setAvailabilities(a)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Hasta</label>
                  <input
                    type="time"
                    value={avail.endTime}
                    onChange={(e) => {
                      const a = [...availabilities]
                      a[i].endTime = e.target.value
                      setAvailabilities(a)
                    }}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                  />
                </div>
                <div className="flex items-end">
                  {availabilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAvailabilities(availabilities.filter((_, j) => j !== i))}
                      className="text-sm text-red-400/70 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
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
            className="flex items-center gap-2 text-sm font-medium text-amber-400/70 hover:text-amber-300"
          >
            + Añadir horario
          </button>
        </div>
      </div>

      {/* Stripe */}
      <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/50 to-purple-950/60 p-6 shadow-xl shadow-sky-950/20">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/30 to-blue-500/20 text-xl shadow-lg shadow-sky-500/20">💳</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Cobrar con Stripe</h2>
            <p className="text-sm text-purple-300/50">Recibe los pagos directamente en tu banco</p>
          </div>
        </div>
        <StripeConnectSection />
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50 disabled:opacity-50"
        >
          {loading ? "✨ Publicando..." : "✨ Publicar perfil"}
        </button>
      </div>
    </form>
  )
}

function StripeConnectSection() {
  const [stripeConnected, setStripeConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/stripe/connect")
      .then((r) => r.json())
      .then((data) => {
        setStripeConnected(data.connected)
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [])

  async function handleConnect() {
    setLoading(true)
    const res = await fetch("/api/stripe/connect", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  if (fetching) return <p className="text-sm text-purple-300/40">Comprobando estado...</p>

  if (stripeConnected) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        Stripe conectado. Los pagos llegarán directamente a tu banco.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-sky-500/20 bg-purple-950/40 p-5 text-center">
      <p className="mb-4 text-sm text-purple-300/50">
        Conecta tu cuenta de Stripe para cobrar de forma segura
      </p>
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
      >
        {loading ? "Conectando..." : "Conectar con Stripe"}
      </button>
    </div>
  )
}
