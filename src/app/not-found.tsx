import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="text-5xl opacity-40">☥</span>

        <h1 className="mt-6 text-2xl font-bold text-white">
          Esta página no existe
        </h1>
        <p className="mt-2 text-sm text-purple-300/60">
          Puede que el enlace haya cambiado o que la página ya no esté disponible.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/explore"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
          >
            Explorar profesionales
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-purple-500/30 px-6 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
