import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Profesionales — Wakeup",
  description: "Encuentra profesionales del bienestar holístico: yoga, meditación, reiki, tarot, astrología y más. Conecta con tu guía ideal.",
  openGraph: { title: "Profesionales — Wakeup", description: "Conecta con profesionales del despertar espiritual" },
}

export default async function ProfessionalsPage() {
  const professionals = await prisma.user.findMany({
    where: {
      role: "PROFESSIONAL",
      professionalProfile: { published: true },
    },
    include: {
      professionalProfile: true,
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Profesionales</h1>
      <p className="mt-1 text-purple-300/60">
        Encuentra al profesional perfecto para ti
      </p>

      {professionals.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-purple-300/40">
            Aún no hay profesionales registrados. ¡Sé el primero!
          </p>
          <Link
            href="/auth/register?role=PROFESSIONAL"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25"
          >
            Registrarme como profesional
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro) => {
            const p = pro.professionalProfile!
            const specialties = p.specialties
              ? p.specialties.split(",").map((s) => s.trim())
              : []

            return (
              <Link
                key={pro.id}
                href={`/professionals/${pro.id}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-purple-500/30 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-lg font-bold text-white">
                    {pro.name?.[0] || "?"}
                  </div>
                  <div>
                    <h2 className="font-semibold text-white group-hover:text-purple-300">
                      {pro.name}
                    </h2>
                    {p.title && (
                      <p className="text-sm text-purple-300/50">{p.title}</p>
                    )}
                  </div>
                </div>

                {p.bio && (
                  <p className="mt-4 text-sm text-purple-200/70 line-clamp-2">
                    {p.bio}
                  </p>
                )}

                {specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {p.pricePerSession > 0 && (
                  <p className="mt-4 text-sm font-medium text-amber-300">
                    Desde {p.pricePerSession / 100} &euro;
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
