"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface FeaturedProfile {
  id: string
  title: string
  city: string | null
  specialties: string
  user: { name: string | null; image: string | null }
}

export function FeaturedCarousel() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch("/api/professionals/featured")
      .then((r) => r.json())
      .then((data) => setProfiles(data.profiles || []))
      .catch((e) => console.error("Featured carousel error:", e))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(profiles.length, 1))
  }, [profiles.length])

  useEffect(() => {
    if (profiles.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [profiles.length, next])

  if (profiles.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-amber-900/40 py-14 shadow-lg shadow-purple-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center px-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Destacados de la semana
          </div>
          <p className="text-xl font-bold text-white mb-2">Aún no hay profesionales destacados</p>
          <p className="text-sm text-purple-300/60 mb-6">Sé el primero en aparecer en el carrusel principal y llega a miles de personas</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register?role=PROFESSIONAL"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50 hover:scale-105"
            >
              Regístrate como profesional
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
            >
              Publicita tu perfil
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const p = profiles[current]

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-amber-900/40 py-12 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.08),transparent_60%)]" />
      {profiles.length > 2 && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          DESTACADO
        </div>
      )}
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Link
          href={`/professionals/${p.id}`}
          className="group block"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-3xl font-bold text-white shadow-xl shadow-purple-500/30 ring-4 ring-purple-400/20 transition group-hover:ring-purple-400/40 group-hover:scale-105">
              {p.user.image ? (
                <img src={p.user.image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                (p.user.name?.[0] || "P")
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition">
            {p.title || p.user.name || "Profesional destacado"}
          </h3>
          {p.city && (
            <p className="mt-1.5 text-sm text-purple-300/60">
              <span className="text-purple-400/50">📍</span> {p.city}
            </p>
          )}
          {p.specialties && (
            <p className="mt-3 text-sm text-purple-200/70 line-clamp-2">{p.specialties}</p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition group-hover:shadow-purple-600/40 group-hover:scale-105">
            Ver perfil
            <span>→</span>
          </span>
        </Link>
        <div className="mt-7 flex items-center justify-center gap-2">
          {profiles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-7 bg-gradient-to-r from-purple-400 to-amber-400" : "w-2 bg-purple-600/40 hover:bg-purple-500/60"}`}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-4">
          <Link
            href="/advertise"
            className="inline-flex items-center gap-1.5 text-xs text-purple-300/40 hover:text-purple-300/70 transition"
          >
            <span>✦</span>
            ¿Quieres aparecer aquí? Publicítate
          </Link>
          <span className="text-purple-300/20">|</span>
          <Link
            href="/auth/register?role=PROFESSIONAL"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300/60 hover:text-amber-300 transition"
          >
            Regístrate gratis
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
