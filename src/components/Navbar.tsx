"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="relative z-50 border-b border-white/10 bg-[#0a0515]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☥</span>
          <span className="text-lg font-bold tracking-wider text-purple-200">
            WAKEUP
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
          >
            Explorar
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
              >
                Dashboard
              </Link>
              {session.user.role === "PROFESSIONAL" && (
                <Link
                  href="/dashboard/profile"
                  className="text-sm font-medium text-purple-300/70 transition hover:text-purple-200"
                >
                  Mi Perfil
                </Link>
              )}
              <span className="text-sm text-purple-300/40">{session.user.name}</span>
              <button
                onClick={() => signOut()}
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
      </div>
    </nav>
  )
}
