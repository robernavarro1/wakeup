"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      setMessage("Enlace de verificación inválido.")
      return
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success")
          setMessage("Tu email ha sido verificado correctamente. Ya puedes iniciar sesión.")
        } else {
          setStatus("error")
          setMessage(data.error || "Error al verificar el email.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Error de conexión. Inténtalo de nuevo.")
      })
  }, [token, email])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
              <span className="inline-flex gap-1 text-2xl text-purple-400">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</span>
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Verificando tu email...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Email verificado</h2>
            <p className="mt-2 text-sm text-purple-300/50">{message}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Error de verificación</h2>
            <p className="mt-2 text-sm text-purple-300/50">{message}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
            >
              Volver a inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-purple-300/50">Cargando...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
