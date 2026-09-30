"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") || "STUDENT"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(roleParam)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName) {
      setError("Escribe tu nombre")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Escribe un email válido (por ejemplo: nombre@correo.com)")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password, role, acceptTerms }),
      })

      let data: { error?: string } = {}
      try {
        data = await res.json()
      } catch {
        setError("El servidor no ha respondido correctamente. Inténtalo de nuevo en unos segundos.")
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error || "No hemos podido crear tu cuenta. Inténtalo de nuevo.")
        setLoading(false)
        return
      }

      router.push("/auth/login?registered=true")
    } catch {
      setError("No hemos podido conectar. Revisa tu conexión a internet e inténtalo de nuevo.")
      setLoading(false)
    }
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
          <label className="block text-sm font-medium text-purple-300/70">¿Qué buscas?</label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                role === "STUDENT"
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                  : "border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              Empieza a explorar
            </button>
            <button
              type="button"
              onClick={() => setRole("PROFESSIONAL")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                role === "PROFESSIONAL"
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                  : "border-white/10 text-white/60 hover:bg-white/5"
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
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-purple-300/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="Mínimo 8 caracteres"
          />
          {password.length > 0 && password.length < 8 && (
            <p className="mt-1 text-xs text-amber-400/80">
              Te faltan {8 - password.length} caracteres
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-white/10 bg-white/5"
          />
          <span>
            Acepto los{" "}
            <Link href="/terms" target="_blank" className="text-purple-400 underline hover:text-purple-300">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacy" target="_blank" className="text-purple-400 underline hover:text-purple-300">
              Política de Privacidad
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !acceptTerms}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0a0515] px-3 text-white/40">o regístrate con</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={() => {
          const role = searchParams.get("role") || "STUDENT"
          signIn("google", { callbackUrl: role === "PROFESSIONAL" ? "/dashboard" : "/explore" })
        }}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <p className="mt-6 text-center text-sm text-white/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-purple-400 hover:text-purple-300">
          Inicia sesión
        </Link>
      </p>
    </>
  )
}
