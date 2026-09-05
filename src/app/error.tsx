"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="text-5xl opacity-40">☥</span>

        <h1 className="mt-6 text-2xl font-bold text-white">
          Algo no ha ido bien
        </h1>
        <p className="mt-2 text-sm text-purple-300/60">
          Ha ocurrido un error inesperado. Puedes intentarlo de nuevo o volver al
          inicio.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-lg border border-purple-500/30 px-6 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10"
          >
            Volver al inicio
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-purple-300/30">
            Referencia: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
