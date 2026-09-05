"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step2fa, setStep2fa] = useState(false)
  const [code, setCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [devCode, setDevCode] = useState("")

  function safeCallbackUrl(url: string | null): string {
    if (!url) return "/explore"
    try {
      const parsed = new URL(url, window.location.origin)
      if (parsed.origin !== window.location.origin) return "/explore"
      return parsed.pathname + parsed.search + parsed.hash
    } catch {
      return "/explore"
    }
  }

  async function completeSignIn(cleanEmail: string) {
    const result = await signIn("credentials", {
      email: cleanEmail,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("No hemos podido iniciar tu sesión. Inténtalo de nuevo.")
      setLoading(false)
      return
    }

    const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"))
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setError("Escribe tu email y tu contraseña")
      return
    }

    setLoading(true)
    setError("")

    try {
      const credRes = await fetch("/api/auth/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      if (credRes.status === 429) {
        setError("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.")
        setLoading(false)
        return
      }

      if (!credRes.ok) {
        setError("Email o contraseña incorrectos")
        setLoading(false)
        return
      }

      const twofaRes = await fetch("/api/auth/2fa/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      })

      if (twofaRes.ok) {
        let twofaData: { devCode?: string; emailSent?: boolean } = {}
        try {
          twofaData = await twofaRes.json()
        } catch {
          twofaData = {}
        }

        // Si el email de verificación no se pudo entregar, no dejamos al
        // usuario atrapado: sus credenciales ya son válidas, entramos directo.
        if (twofaData.emailSent === false && !twofaData.devCode) {
          await completeSignIn(cleanEmail)
          return
        }

        setDevCode(twofaData.devCode || "")
        setStep2fa(true)
        setCodeSent(true)
        setLoading(false)
        return
      }

      await completeSignIn(cleanEmail)
    } catch {
      setError("No hemos podido conectar. Revisa tu conexión a internet e inténtalo de nuevo.")
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const cleanEmail = email.trim().toLowerCase()

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code, trustDevice }),
      })

      let data: { verified?: boolean; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        setError("El servidor no ha respondido correctamente. Inténtalo de nuevo.")
        setLoading(false)
        return
      }

      if (!data.verified) {
        setError(data.error || "El código no es correcto o ha caducado")
        setLoading(false)
        return
      }

      await completeSignIn(cleanEmail)
    } catch {
      setError("No hemos podido conectar. Revisa tu conexión a internet e inténtalo de nuevo.")
      setLoading(false)
    }
  }

  if (step2fa) {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {codeSent && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-300">
            Código enviado a {email}
          </div>
        )}

        {devCode && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-300 text-center">
            Modo desarrollo — Código: <strong className="text-xl tracking-widest">{devCode}</strong>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-purple-300/70">
            Código de verificación
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white text-center text-2xl tracking-widest focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="000000"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-purple-300/50">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="rounded border-white/10 bg-white/5"
          />
          Confiar en este dispositivo
        </label>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Verificar código"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={async () => {
              setCode("")
              setDevCode("")
              setError("")
              try {
                const res = await fetch("/api/auth/2fa/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email.trim().toLowerCase() }),
                })
                const data = await res.json()
                setDevCode(data.devCode || "")
                if (data.emailSent === false) {
                  setError("No hemos podido enviarte el email. Vuelve atrás e inicia sesión de nuevo.")
                } else {
                  setCodeSent(true)
                }
              } catch {
                setError("No hemos podido reenviar el código. Revisa tu conexión.")
              }
            }}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Reenviar código
          </button>
        </div>
      </form>
    )
  }

  const justRegistered = searchParams.get("registered") === "true"

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {justRegistered && !error && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            <p className="font-medium">¡Cuenta creada correctamente!</p>
            <p className="mt-1 text-emerald-300/70">
              Te hemos enviado un email de confirmación. Ya puedes iniciar sesión.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-300/70">
            Email
          </label>
          <input
            id="email"
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-purple-300/70">
              Contraseña
            </label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-purple-400 hover:text-purple-300">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-purple-300/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-purple-300/50">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/register" className="font-medium text-purple-400 hover:text-purple-300">
          Regístrate
        </Link>
      </p>
    </>
  )
}
