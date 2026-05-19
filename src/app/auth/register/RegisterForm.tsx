"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") || "STUDENT"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(roleParam)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al registrarse")
      setLoading(false)
      return
    }

    router.push("/auth/login?registered=true")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-purple-300/70">Tipo de cuenta</label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                role === "STUDENT"
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                  : "border-white/10 text-purple-300/50 hover:bg-white/5"
              }`}
            >
              Alumno
            </button>
            <button
              type="button"
              onClick={() => setRole("PROFESSIONAL")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                role === "PROFESSIONAL"
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                  : "border-white/10 text-purple-300/50 hover:bg-white/5"
              }`}
            >
              Profesional
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300/70">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-purple-300/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-purple-300/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300/70">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-purple-300/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-purple-300/50">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-purple-400 hover:text-purple-300">
          Inicia sesión
        </Link>
      </p>
    </>
  )
}
