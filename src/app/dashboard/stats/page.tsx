"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface StatsData {
  summary: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    activeBookings: number
    cancelRate: number
  }
  demographics: {
    age: Record<string, number>
    gender: Record<string, number>
    topCities: { city: string; count: number }[]
  }
  cancelReasons: { reason: string; count: number }[]
  cancelDetails: string[]
  topServices: { name: string; count: number; revenue: number }[]
  monthlyTrend: { month: string; bookings: number; cancellations: number }[]
}

function BarChart({ data, max }: { data: { label: string; value: number; color?: string }[]; max: number }) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-white/60 text-right">{item.label}</span>
          <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${item.color || "bg-purple-500"}`}
              style={{ width: max > 0 ? `${(item.value / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="w-8 text-xs font-medium text-white/70">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/professionals/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setStats(data)
        }
      })
      .catch(() => setError("Error al cargar estadísticas"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/30 p-8 text-center">
          <p className="text-lg font-semibold text-amber-300">{error}</p>
          <p className="mt-2 text-sm text-white/60">
            Las estadísticas avanzadas están disponibles con el plan <strong>Bosque</strong>.
          </p>
          <a
            href="/dashboard/subscription"
            className="mt-4 inline-block rounded-xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
            Ver planes
          </a>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const { summary, demographics, cancelReasons, cancelDetails, topServices, monthlyTrend } = stats
  const maxAge = Math.max(...Object.values(demographics.age))
  const maxGender = Math.max(...Object.values(demographics.gender))
  const maxCity = Math.max(...demographics.topCities.map((c) => c.count), 1)
  const maxReason = Math.max(...cancelReasons.map((r) => r.count), 1)
  const maxService = Math.max(...topServices.map((s) => s.count), 1)
  const maxTrend = Math.max(...monthlyTrend.map((m) => m.bookings + m.cancellations), 1)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Estadísticas avanzadas</h1>
        <p className="mt-1 text-white/60">Análisis de tus reservas y clientes</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300"
        >
          &larr; Volver al panel
        </button>
      </div>

      {/* Resumen */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total reservas", value: summary.totalBookings, color: "text-white" },
          { label: "Completadas", value: summary.completedBookings, color: "text-emerald-400" },
          { label: "Activas", value: summary.activeBookings, color: "text-blue-400" },
          { label: "Canceladas", value: summary.cancelledBookings, color: "text-red-400" },
          { label: "Tasa cancelación", value: `${summary.cancelRate}%`, color: summary.cancelRate > 30 ? "text-red-400" : "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tendencia mensual */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Tendencia mensual</h2>
        <div className="flex items-end gap-2 h-40">
          {monthlyTrend.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex flex-col items-center gap-0.5 w-full" style={{ height: "120px" }}>
                <div
                  className="w-full bg-purple-500/60 rounded-t"
                  style={{ height: `${maxTrend > 0 ? (m.bookings / maxTrend) * 100 : 0}%`, minHeight: m.bookings > 0 ? "4px" : "0" }}
                />
                <div
                  className="w-full bg-red-500/40 rounded-b"
                  style={{ height: `${maxTrend > 0 ? (m.cancellations / maxTrend) * 100 : 0}%`, minHeight: m.cancellations > 0 ? "4px" : "0" }}
                />
              </div>
              <span className="text-[10px] text-white/40">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-white/50"><span className="h-2 w-2 rounded bg-purple-500/60" /> Reservas</span>
          <span className="flex items-center gap-1.5 text-xs text-white/50"><span className="h-2 w-2 rounded bg-red-500/40" /> Cancelaciones</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Edad */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Edad de tus clientes</h2>
          <BarChart
            data={Object.entries(demographics.age).map(([label, value]) => ({
              label,
              value,
              color: "bg-purple-500",
            }))}
            max={maxAge}
          />
        </div>

        {/* Sexo */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Género</h2>
          <BarChart
            data={Object.entries(demographics.gender).map(([label, value]) => ({
              label,
              value,
              color: "bg-pink-500",
            }))}
            max={maxGender}
          />
        </div>

        {/* Ubicación */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Ciudades principales</h2>
          {demographics.topCities.length > 0 ? (
            <BarChart
              data={demographics.topCities.map((c) => ({
                label: c.city,
                value: c.count,
                color: "bg-emerald-500",
              }))}
              max={maxCity}
            />
          ) : (
            <p className="text-sm text-white/40">Sin datos de ubicación</p>
          )}
        </div>

        {/* Motivos de cancelación */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Motivos de cancelación</h2>
          {cancelReasons.length > 0 ? (
            <>
              <BarChart
                data={cancelReasons.map((r) => ({
                  label: r.reason,
                  value: r.count,
                  color: "bg-red-500",
                }))}
                max={maxReason}
              />
              {cancelDetails.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-medium text-white/50 mb-2">Comentarios de clientes:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cancelDetails.slice(0, 10).map((d, i) => (
                      <p key={i} className="text-xs text-white/40 italic">&ldquo;{d}&rdquo;</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-white/40">Sin cancelaciones registradas</p>
          )}
        </div>

        {/* Servicios más populares */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-white">Servicios más populares</h2>
          {topServices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topServices.map((s, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-sm text-white/50">{s.count} reserva{s.count !== 1 ? "s" : ""}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-300">{(s.revenue / 100).toFixed(2)} €</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Sin datos de servicios</p>
          )}
        </div>
      </div>
    </div>
  )
}
