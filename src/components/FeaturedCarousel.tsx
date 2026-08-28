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

const DEMO_PROFILES: FeaturedProfile[] = [
  { id: "demo-1", title: "Luna Fernández — Sanación Energética", city: "Barcelona", specialties: "Reiki Usui, Meditación guiada, Sanación con cuencos tibetanos, Limpieza de chakras", user: { name: "Luna Fernández", image: null } },
  { id: "demo-2", title: "Centro de Yoga Samadhi", city: "Madrid", specialties: "Hatha Yoga, Vinyasa Flow, Meditación mindfulness, Cursos de formación", user: { name: "Centro Samadhi", image: null } },
  { id: "demo-3", title: "Carlos Montoya — Astrólogo", city: "Valencia", specialties: "Astrología predictiva, Carta natal, Sinastría de pareja, Revolución solar", user: { name: "Carlos Montoya", image: null } },
  { id: "demo-4", title: "Isabel Torres — Tarot Terapéutico", city: "Sevilla", specialties: "Tarot evolutivo, Registros akáshicos, Canalización, Péndulo hebreo", user: { name: "Isabel Torres", image: null } },
]

function getInitials(name: string | null): string {
  if (!name) return "P"
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

export function FeaturedCarousel() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>(DEMO_PROFILES)
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/professionals/featured")
      .then((r) => r.json())
      .then((data) => {
        const real = data.profiles || []
        if (real.length > 0) setProfiles(real)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % profiles.length)
  }, [profiles.length])

  useEffect(() => {
    if (profiles.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [profiles.length, next])

  const p = profiles[current]

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-amber-900/50 py-14 shadow-xl shadow-purple-500/15">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.1),transparent_60%)]" />
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-amber-500/25 px-3.5 py-1.5 text-[11px] font-bold text-amber-200 border border-amber-400/40">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        DESTACADO
      </div>
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Link
          href={p.id.startsWith("demo") ? "/auth/register?role=PROFESSIONAL" : `/professionals/${p.id}`}
          className="group block"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-4xl font-bold text-white shadow-2xl shadow-purple-500/30 ring-4 ring-purple-400/20 transition group-hover:ring-purple-400/50 group-hover:scale-110">
              {p.user.image ? (
                <img src={p.user.image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(p.user.name)
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition">
            {p.title}
          </h3>
          {p.city && (
            <p className="mt-2 text-sm text-purple-300/60">
              <span className="text-purple-400/50">📍</span> {p.city}
            </p>
          )}
          <p className="mt-3 text-sm text-purple-200/70 line-clamp-2">{p.specialties}</p>
          <span className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-purple-600/30 transition group-hover:shadow-purple-600/50 group-hover:scale-105">
            {p.id.startsWith("demo") ? "Únete como profesional" : "Ver perfil completo"}
            <span className="text-base">→</span>
          </span>
        </Link>
        <div className="mt-8 flex items-center justify-center gap-2">
          {profiles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-gradient-to-r from-purple-400 to-amber-400" : "w-2 bg-purple-600/40 hover:bg-purple-500/60"}`}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/auth/register?role=PROFESSIONAL"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 hover:scale-105"
          >
            Regístrate gratis
            <span>→</span>
          </Link>
          <Link
            href="/advertise"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-400/30 bg-amber-500/10 px-6 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-500/20 hover:border-amber-400/50"
          >
            ✦ Publicita tu perfil
          </Link>
        </div>
      </div>
    </section>
  )
}
