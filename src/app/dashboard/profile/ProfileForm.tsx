"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PLANS } from "@/lib/plans"
import { SPECIALTIES } from "@/lib/specialties"

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

const planIcons: Record<string, string> = { SEMILLA: "🌱", ARBOL: "🌳", BOSQUE: "🌲" }

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
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    profile?.specialties ? profile.specialties.split(",").map(s => s.trim()).filter(Boolean) : []
  )
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

  const [subData, setSubData] = useState<any>(null)
  const [subFetching, setSubFetching] = useState(true)
  const [subLoading, setSubLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => { setSubData(data); setSubFetching(false) })
      .catch(() => setSubFetching(false))
  }, [])

  const plans = subData?.plans || PLANS
  const currentPlanKey = subData?.subscription?.plan || null
  const currentPlan = currentPlanKey ? plans[currentPlanKey] : null
  const trialEnds = subData?.subscription?.trialEndsAt ? new Date(subData.subscription.trialEndsAt) : null
  const trialActive = subData?.trialActive
  const trialUsed = subData?.trialUsed
  const isSubActive = subData?.isActive

  const maxCategories = currentPlan?.maxCategories ?? 0
  const maxDisciplines = currentPlan?.maxDisciplines ?? 0
  const canAddService = maxDisciplines === 0 || services.length < maxDisciplines

  async function selectPlan(plan: string) {
    setSubLoading(plan)
    try {
      const res = await fetch("/api/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { alert("Error del servidor. Inténtalo de nuevo."); return }
      if (data.error) { alert(data.error); setSubLoading(null); return }
      if (data.url) { window.location.href = data.url; return }
      alert(data.message || "Plan activado")
      window.location.reload()
    } catch { alert("Error de conexión") }
    setSubLoading(null)
  }

  async function payPlan(plan: string) {
    setSubLoading(plan)
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, promoCode: "WAKEUP1" }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { alert("Error del servidor. Inténtalo de nuevo."); return }
      if (data.error) { alert(data.error); setSubLoading(null); return }
      if (data.url) { window.location.href = data.url; return }
      alert(data.message || "Suscripción creada")
      window.location.reload()
    } catch { alert("Error de conexión") }
    setSubLoading(null)
  }

  async function cancelSub() {
    if (!confirm("¿Seguro que quieres cancelar tu suscripción?")) return
    setSubLoading("cancel")
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { alert("Error del servidor"); return }
      if (data.error) { alert(data.error); return }
      alert(data.message || "Suscripción cancelada")
      window.location.reload()
    } catch { alert("Error de conexión") }
    setSubLoading(null)
  }

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
        specialties: selectedSpecialties.join(", "),
        services: services.filter((s) => s.name).slice(0, maxDisciplines || 999),
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
        </div>
      </div>

      {/* Plan - después de info básica */}
      <SubscriptionSectionBlock
        subFetching={subFetching}
        subData={subData}
        plans={plans}
        currentPlanKey={currentPlanKey}
        trialActive={trialActive}
        trialUsed={trialUsed}
        trialEnds={trialEnds}
        subLoading={subLoading}
        onPay={payPlan}
        onSelect={selectPlan}
        onCancel={cancelSub}
      />

      {/* Disciplinas / Especialidades - controlado por plan */}
      <PlanControlledSection
        title="Especialidades"
        icon="🎯"
        gradient="from-purple-500/30 to-amber-500/20"
        unlocked={isSubActive}
        planName={currentPlan?.name}
        limit={maxCategories}
        currentCount={selectedSpecialties.length}
      >
        <SpecialtySelector
          selected={selectedSpecialties}
          onChange={setSelectedSpecialties}
          max={maxCategories}
          disabled={!isSubActive}
        />
      </PlanControlledSection>

      {/* Servicios - controlado por plan */}
      <PlanControlledSection
        title="Servicios"
        icon="🌟"
        gradient="from-amber-500/30 to-yellow-500/20"
        unlocked={isSubActive}
        planName={currentPlan?.name}
        limit={maxDisciplines}
        currentCount={services.filter(s => s.name).length}
      >
        <div className="space-y-4">
          {services.map((service, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-purple-950/40 p-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-purple-300/50">Nombre</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => { const s = [...services]; s[i].name = e.target.value; setServices(s) }}
                    disabled={!isSubActive}
                    className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
                    placeholder="Sesión individual de yoga"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Duración (min)</label>
                  <input type="number" value={service.durationMinutes} onChange={(e) => { const s = [...services]; s[i].durationMinutes = parseInt(e.target.value); setServices(s) }} disabled={!isSubActive} className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Precio (€)</label>
                  <input type="number" value={service.price || ""} onChange={(e) => { const s = [...services]; s[i].price = parseInt(e.target.value); setServices(s) }} disabled={!isSubActive} className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40" />
                </div>
              </div>
              {services.length > 1 && (
                <button type="button" onClick={() => setServices(services.filter((_, j) => j !== i))} className="mt-3 text-sm text-red-400/70 hover:text-red-300">Eliminar servicio</button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setServices([...services, { name: "", description: "", durationMinutes: 60, price: 0 }])}
            disabled={!canAddService}
            className="flex items-center gap-2 text-sm font-medium text-amber-400/70 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            + Añadir servicio {!canAddService && `(máx. ${maxDisciplines >= 999 ? "∞" : maxDisciplines})`}
          </button>
        </div>
      </PlanControlledSection>

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
                  <select value={avail.dayOfWeek} onChange={(e) => { const a = [...availabilities]; a[i].dayOfWeek = parseInt(e.target.value); setAvailabilities(a) }} className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15">
                    {DAYS.map((day, idx) => (<option key={idx} value={idx} className="bg-[#0a0515] text-white">{day}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Desde</label>
                  <input type="time" value={avail.startTime} onChange={(e) => { const a = [...availabilities]; a[i].startTime = e.target.value; setAvailabilities(a) }} className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-300/50">Hasta</label>
                  <input type="time" value={avail.endTime} onChange={(e) => { const a = [...availabilities]; a[i].endTime = e.target.value; setAvailabilities(a) }} className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15" />
                </div>
                <div className="flex items-end">
                  {availabilities.length > 1 && (<button type="button" onClick={() => setAvailabilities(availabilities.filter((_, j) => j !== i))} className="text-sm text-red-400/70 hover:text-red-300">Eliminar</button>)}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setAvailabilities([...availabilities, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }])} className="flex items-center gap-2 text-sm font-medium text-amber-400/70 hover:text-amber-300">+ Añadir horario</button>
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
        <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50 disabled:opacity-50">
          {loading ? "✨ Publicando..." : "✨ Publicar perfil"}
        </button>
      </div>
    </form>
  )
}

function PlanControlledSection({ title, icon, gradient, unlocked, planName, limit, currentCount, children }: {
  title: string; icon: string; gradient: string; unlocked: boolean | null; planName: string; limit: number; currentCount: number; children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border p-6 shadow-xl transition ${unlocked ? "border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-purple-950/60 shadow-amber-950/20" : "border-purple-500/10 bg-purple-950/30 opacity-60"}`}>
      <div className="mb-6 flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg ${unlocked ? `bg-gradient-to-br ${gradient}` : "bg-purple-950/60"}`}>{unlocked ? icon : "🔒"}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {!unlocked && (
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] text-purple-300/50 border border-purple-500/20">
                Elegir plan
              </span>
            )}
          </div>
          <p className="text-sm text-purple-300/50">
            {unlocked
              ? `${currentCount}/${limit >= 999 ? "∞" : limit} usadas`
              : `Elige un plan para desbloquear esta sección — ${planName || "Semilla, Árbol o Bosque"}`}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SubscriptionSectionBlock({ subFetching, subData, plans, currentPlanKey, trialActive, trialUsed, trialEnds, subLoading, onPay, onSelect, onCancel }: {
  subFetching: boolean; subData: any; plans: any; currentPlanKey: string | null; trialActive: boolean; trialUsed: boolean; trialEnds: Date | null; subLoading: string | null; onPay: (plan: string) => Promise<void>; onSelect: (plan: string) => Promise<void>; onCancel: () => Promise<void>
}) {
  if (subFetching) return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-950/50 p-6">
      <p className="text-sm text-purple-300/40">Cargando planes...</p>
    </div>
  )

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 to-amber-950/30 p-6 shadow-xl shadow-purple-950/20">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 text-xl shadow-lg shadow-purple-500/20">🌿</span>
        <div>
          <h2 className="text-lg font-semibold text-white">Tu plan</h2>
          <p className="text-sm text-purple-300/50">Elige el plan que desbloquea todas las funciones</p>
        </div>
      </div>

      {currentPlanKey && trialActive && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">
          {planIcons[currentPlanKey] || "🌱"} Plan {currentPlanKey} — periodo de prueba hasta el {trialEnds?.toLocaleDateString("es-ES")}
        </div>
      )}

      {subData?.subscription?.status === "CANCELLED" && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-950/60 px-4 py-3 text-sm text-red-300">
          Suscripción cancelada — puedes contratar un plan de pago
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {(Object.entries(plans) as [string, any][]).map(([key, plan]) => {
          const isCurrent = currentPlanKey === key
          const isCancelled = subData?.subscription?.status === "CANCELLED" && isCurrent
          return (
            <div key={key} className={`relative rounded-xl border p-5 transition ${isCurrent && !isCancelled ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30" : isCancelled ? "border-red-500/20 bg-red-500/5 ring-1 ring-red-500/20" : "border-purple-500/10 bg-purple-950/40 hover:border-purple-500/30 hover:bg-purple-950/50"}`}>
              {isCurrent && !isCancelled && <span className="absolute -top-2.5 right-3 rounded-full bg-purple-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">ACTUAL</span>}
              {isCancelled && <span className="absolute -top-2.5 right-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">CANCELADO</span>}
              <div className="text-3xl mb-1 text-center">{planIcons[key] || "🌿"}</div>
              <h3 className="text-center text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-center mt-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(plan.price / 100)}
              </p>
              <p className="text-center text-xs text-purple-300/40">/mes</p>

              <ul className="mt-4 space-y-2">
                {(plan.benefits || []).map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-purple-300/70">
                    <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>

              {isCurrent && (trialActive || subData?.subscription?.status === "ACTIVE") && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={subLoading === "cancel"}
                  className="mt-5 w-full rounded-lg border border-red-500/30 py-2 text-xs text-red-300/70 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {subLoading === "cancel" ? "..." : "Cancelar suscripción"}
                </button>
              )}

              {!isCurrent && (
                <div className="mt-5 flex flex-col gap-2">
                  <button onClick={() => onPay(key)} disabled={subLoading === key} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {subLoading === key ? "..." : "Pagar ahora"}
                  </button>
                  {!trialUsed && (
                    <button onClick={() => onSelect(key)} disabled={subLoading === key} className="w-full rounded-lg border border-purple-500/30 py-2 text-xs text-purple-300/70 transition hover:bg-purple-500/10 disabled:opacity-50">
                      Probar {plan.trialDays} días gratis
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SpecialtySelector({ selected, onChange, max, disabled }: {
  selected: string[]; onChange: (vals: string[]) => void; max: number; disabled: boolean
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return SPECIALTIES.filter(s => !selected.includes(s))
    const q = query.toLowerCase().trim()
    return SPECIALTIES.filter(s => s.toLowerCase().includes(q) && !selected.includes(s))
  }, [query, selected])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const atLimit = max > 0 && max < 999 && selected.length >= max

  function add(s: string) {
    if (atLimit) return
    onChange([...selected, s])
    setQuery("")
    setOpen(false)
  }

  function remove(s: string) {
    onChange(selected.filter(v => v !== s))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-purple-300/70">
        Disciplinas o áreas {max > 0 && max < 999 ? `(máx. ${max})` : max >= 999 ? "(sin límite)" : ""}
      </label>

      <div ref={ref} className="relative mt-1.5">
        {!disabled && !atLimit && (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Busca y selecciona una especialidad..."
              className="block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            {open && filtered.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-purple-500/20 bg-[#120a1e] shadow-xl shadow-purple-950/40">
                {filtered.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => add(s)}
                    className="w-full px-4 py-2.5 text-left text-sm text-purple-200 hover:bg-purple-500/15 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {open && query.trim() && filtered.length === 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-purple-500/20 bg-[#120a1e] px-4 py-3 text-sm text-purple-300/50 shadow-xl shadow-purple-950/40">
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
        {atLimit && (
          <p className="text-sm text-amber-400/60">Has alcanzado el límite de {max} especialidades</p>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-1.5 text-xs text-purple-200 border border-purple-500/20">
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                disabled={disabled}
                className="text-purple-400/60 hover:text-red-400 disabled:opacity-30"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {!disabled && selected.length === 0 && (
        <p className="mt-2 text-xs text-purple-300/40">Escribe arriba para buscar y seleccionar especialidades</p>
      )}
    </div>
  )
}

function StripeConnectSection() {
  const [stripeConnected, setStripeConnected] = useState(false)
  const [detailsSubmitted, setDetailsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/stripe/connect")
      .then((r) => r.json())
      .then((data) => {
        setStripeConnected(data.connected)
        setDetailsSubmitted(data.detailsSubmitted)
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [])

  async function handleConnect() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      alert(data.error || "Error al conectar con Stripe.")
    } catch { alert("Error de conexión") }
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

  if (!detailsSubmitted && stripeConnected) {
    return (
      <div className="rounded-xl border border-dashed border-amber-500/20 bg-amber-950/40 p-5 text-center">
        <p className="mb-4 text-sm text-purple-300/50">La cuenta de Stripe está creada pero falta completar el registro (cuenta bancaria, etc.)</p>
        <button type="button" onClick={handleConnect} disabled={loading} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50">
          {loading ? "Conectando..." : "Completar registro en Stripe"}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-sky-500/20 bg-purple-950/40 p-5 text-center">
      <p className="mb-4 text-sm text-purple-300/50">Conecta tu cuenta de Stripe para cobrar de forma segura</p>
      <button type="button" onClick={handleConnect} disabled={loading} className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50">
        {loading ? "Conectando..." : "Conectar con Stripe"}
      </button>
    </div>
  )
}
