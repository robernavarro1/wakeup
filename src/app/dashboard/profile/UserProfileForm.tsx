"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Discipline {
  name: string
  level: string
}

interface UserProfileData {
  interests: string
  disciplines: string
  level: string
  bio: string | null
  goals: string | null
}

function parseDisciplines(raw: string): Discipline[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return raw.split(",").map((s) => ({ name: s.trim(), level: "" })).filter((d) => d.name)
  }
}

const LEVELS = [
  { value: "PRINCIPIANTE", label: "🌱 Principiante", desc: "estoy empezando" },
  { value: "INTERMEDIO", label: "🌿 Intermedio", desc: "tengo algo de experiencia" },
  { value: "AVANZADO", label: "🌳 Avanzado", desc: "práctica consolidada" },
  { value: "PROFESIONAL", label: "🪷 Profesional", desc: "me dedico a ello" },
]

export function UserProfileForm({ profile }: { profile: UserProfileData | null }) {
  const router = useRouter()
  const [interests, setInterests] = useState(profile?.interests || "")
  const [disciplines, setDisciplines] = useState<Discipline[]>(
    parseDisciplines(profile?.disciplines || "")
  )
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
      body: JSON.stringify({
        interests,
        disciplines: JSON.stringify(disciplines.filter((d) => d.name)),
        bio,
        goals,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  function addDiscipline() {
    setDisciplines([...disciplines, { name: "", level: "PRINCIPIANTE" }])
  }

  function removeDiscipline(i: number) {
    setDisciplines(disciplines.filter((_, j) => j !== i))
  }

  function updateDiscipline(i: number, field: keyof Discipline, value: string) {
    const d = [...disciplines]
    d[i][field] = value
    setDisciplines(d)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/60 p-4 text-sm text-emerald-300">
          ✨ Perfil actualizado correctamente
        </div>
      )}

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

          {/* Disciplines */}
          <div>
            <label className="block text-sm font-medium text-purple-300/70">Disciplinas que practicas</label>
            <p className="mt-0.5 text-xs text-purple-300/40">Añade cada disciplina con su nivel</p>
            <div className="mt-3 space-y-3">
              {disciplines.map((d, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-purple-950/40 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-purple-300/50">Disciplina</label>
                      <input
                        type="text"
                        value={d.name}
                        onChange={(e) => updateDiscipline(i, "name", e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                        placeholder="Hatha Yoga"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-300/50">Nivel</label>
                      <select
                        value={d.level}
                        onChange={(e) => updateDiscipline(i, "level", e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/70 px-3 py-2 text-sm text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
                      >
                        {LEVELS.map((l) => (
                          <option key={l.value} value={l.value} className="bg-[#0a0515]">{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {disciplines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDiscipline(i)}
                      className="mt-2 text-sm text-red-400/70 hover:text-red-300"
                    >
                      Eliminar disciplina
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDiscipline}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-400/70 hover:text-amber-300"
            >
              + Añadir disciplina
            </button>
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
