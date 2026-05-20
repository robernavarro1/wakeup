"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="relative z-50 border-b border-white/10 bg-[#0a0515]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logo_grad)" />
            <path d="M8 22L12 10L16 18L20 10L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo_grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-bold tracking-wider text-purple-200">
            WAKEUP
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/explore"
            className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
          >
            Explorar
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
          >
            Productos
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
              >
                Mi Perfil
              </Link>
              <Link href="/cart" className="relative text-purple-300/70 transition hover:text-purple-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </Link>
              <span className="hidden text-sm text-purple-300/40 lg:inline">{session.user.name}</span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/signout", { method: "POST" })
                  window.location.href = "/"
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70 transition hover:bg-white/5 hover:text-purple-200"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 sm:hidden">
          {!session?.user ? (
            <Link
              href="/auth/register"
              className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
            >
              Registrarse
            </Link>
          ) : (
            <Link href="/cart" className="text-purple-300/70 transition hover:text-purple-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-purple-300/70 hover:bg-white/5"
            aria-label="Menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0a0515]/95 px-4 pb-6 pt-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/explore" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-purple-300/70 hover:text-purple-200">
              Explorar
            </Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-purple-300/70 hover:text-purple-200">
              Productos
            </Link>
            {session?.user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-purple-300/70 hover:text-purple-200">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-purple-300/70 hover:text-purple-200">
                  Mi Perfil
                </Link>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-sm text-purple-300/40">{session.user.name}</span>
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/signout", { method: "POST" })
                      window.location.href = "/"
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-purple-300/70"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-purple-300/70 hover:text-purple-200">
                  Carrito
                </Link>
                <div className="flex gap-3 border-t border-white/5 pt-3">
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-purple-300/70">
                    Entrar
                  </Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
