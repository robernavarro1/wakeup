"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AD_PLANS } from "@/lib/plans"

const adPlanIcons: Record<string, string> = { DESTELLO: "⚡", BRILLO: "✨", RESPLANDOR: "🌟", LUZ: "☀️" }

export default function AdvertisePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (plan: string) => {
    if (!session) { router.push("/auth/login"); return }
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/create-ad-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adPlan: plan }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      alert(data.error || "Error al procesar")
    } catch {
      alert("Error de conexión")
    }
    setLoading(null)
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-5xl opacity-40">☥</span>
          <h1 className="mt-6 text-4xl font-bold text-white">Publicita tu perfil</h1>
          <p className="mx-auto mt-4 max-w-xl text-purple-200/60">
            Aparece en el carrusel del explorador de Wakeup y haz que cientos de personas descubran tus servicios.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(AD_PLANS) as [string, typeof AD_PLANS[keyof typeof AD_PLANS]][]).map(([key, plan]) => (
            <div key={key} className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/50 to-transparent p-6 shadow-xl shadow-purple-950/20">
              <div className="text-4xl mb-3 text-center">{adPlanIcons[key] || "📢"}</div>
              <h3 className="text-center text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-center mt-1 text-sm text-purple-300/50">{plan.label}</p>
              <p className="text-center mt-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(plan.price / 100)}
              </p>
              <p className="text-center mt-1 text-xs text-purple-300/30">
                {(plan.price / 100 / plan.months).toFixed(2)} €/mes
              </p>
              <ul className="mt-4 space-y-1.5">
                {(plan.benefits || []).map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-purple-300/60">
                    <span className="mt-0.5 text-emerald-400">✦</span>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(key)}
                disabled={loading === key}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
              >
                {loading === key ? "Procesando..." : "Contratar"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-purple-500/10 bg-purple-950/30 p-6">
          <h2 className="text-lg font-semibold text-white">¿Cómo funciona?</h2>
          <ul className="mt-4 space-y-2 text-sm text-purple-200/60">
            <li>✦ Contrata un plan y tu perfil aparecerá en el carrusel del explorador</li>
            <li>✦ Los usuarios verán tu nombre, ciudad y especialidades destacadas</li>
            <li>✦ Al hacer clic irán directamente a tu perfil profesional</li>
            <li>✦ El carrusel rota automáticamente entre todos los perfiles destacados</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
