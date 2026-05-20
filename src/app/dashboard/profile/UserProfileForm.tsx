"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface UserProfileData {
  interests: string
  disciplines: string
  level: string
  bio: string | null
  goals: string | null
}

export function UserProfileForm({ profile }: { profile: UserProfileData | null }) {
  const router = useRouter()
  const [interests, setInterests] = useState(profile?.interests || "")
  const [disciplines, setDisciplines] = useState(profile?.disciplines || "")
  const [level, setLevel] = useState(profile?.level || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [goals, setGoals] = useState(profile?.goals || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests, disciplines, level, bio, goals }),
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

      {/* Sobre ti */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl shadow-purple-950/40">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 text-xl shadow-lg shadow-purple-500/20">🧘</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Sobre ti</h2>
            <p className="text-sm text-purple-300/50">Comparte tu camino espiritual</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-300/70">¿Qué te interesa?</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Yoga, Meditación, Reiki, Tarot..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Disciplinas que practicas</label>
            <input
              type="text"
              value={disciplines}
              onChange={(e) => setDisciplines(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Hatha Yoga, Reiki Usui, Meditación Vipassana..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Tu nivel</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="" className="bg-[#0a0515]">Selecciona tu nivel</option>
              <option value="PRINCIPIANTE" className="bg-[#0a0515]">🌱 Principiante — estoy empezando</option>
              <option value="INTERMEDIO" className="bg-[#0a0515]">🌿 Intermedio — tengo algo de experiencia</option>
              <option value="AVANZADO" className="bg-[#0a0515]">🌳 Avanzado — práctica consolidada</option>
              <option value="PROFESIONAL" className="bg-[#0a0515]">🪷 Profesional — me dedico a ello</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Sobre ti</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Cuéntanos brevemente quién eres y qué te trae a Wakeup..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70">Tus metas</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={2}
              className="mt-1.5 block w-full rounded-xl border border-purple-500/20 bg-purple-950/60 px-4 py-3 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="¿Qué te gustaría lograr? Esto ayuda a los profesionales a conocerte mejor..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50 disabled:opacity-50"
        >
          {loading ? "✨ Guardando..." : "✨ Guardar perfil"}
        </button>
      </div>
    </form>
  )
}
