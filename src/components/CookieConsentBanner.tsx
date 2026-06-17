"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const STORAGE_KEY = "wakeup-cookies-accepted"

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0515]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-center text-xs text-purple-300/60 sm:text-left">
          Usamos cookies técnicas necesarias para el funcionamiento de la plataforma.
          Al continuar navegando, aceptas el uso de estas cookies.
          Más información en nuestra{" "}
          <Link href="/cookies" className="text-purple-400 underline hover:text-purple-300">
            Política de Cookies
          </Link>.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/cookies"
            className="text-xs text-purple-400 hover:text-purple-300 underline"
          >
            Más información
          </Link>
          <button
            onClick={accept}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
