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
      <section className="relative overflow-hidden rounded-2xl border border-dashed border-purple-500/20 bg-gradient-to-r from-purple-950/30 to-amber-950/20 py-12">
        <div className="mx-auto max-w-2xl text-center px-4">
          <p className="text-lg text-purple-300/40 mb-3">Espacio publicitario disponible</p>
          <Link
            href="/advertise"
            className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Publicita tu perfil aquí →
          </Link>
        </div>
      </section>
    )
  }

  const p = profiles[current]

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-amber-900/30 py-10">
      {profiles.length > 2 && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
          PUBLICIDAD
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Link
          href={`/professionals/${p.id}`}
          className="group block"
        >
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/30">
              {p.user.image ? (
                <img src={p.user.image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                (p.user.name?.[0] || "P")
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
            {p.title || p.user.name || "Profesional destacado"}
          </h3>
          {p.city && (
            <p className="mt-1 text-sm text-purple-300/50">
              <span className="text-purple-400/40">📍</span> {p.city}
            </p>
          )}
          {p.specialties && (
            <p className="mt-3 text-sm text-purple-200/70 line-clamp-2">{p.specialties}</p>
          )}
          <span className="mt-4 inline-block rounded-lg bg-purple-500/20 px-4 py-1.5 text-xs text-purple-300 border border-purple-500/20 group-hover:bg-purple-500/30 transition">
            Ver perfil →
          </span>
        </Link>
        <div className="mt-6 flex items-center justify-center gap-2">
          {profiles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-purple-400" : "w-2 bg-purple-600/40 hover:bg-purple-500/60"}`}
            />
          ))}
        </div>
        <Link
          href="/advertise"
          className="mt-4 inline-block text-[10px] text-purple-300/20 hover:text-purple-300/50 transition"
        >
          ¿Quieres aparecer aquí? Publicítate →
        </Link>
      </div>
    </section>
  )
}
