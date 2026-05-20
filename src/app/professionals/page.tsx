import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

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
      <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
      <p className="mt-1 text-gray-600">
        Encuentra al profesional perfecto para ti
      </p>

      {professionals.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Aún no hay profesionales registrados. ¡Sé el primero!
          </p>
          <Link
            href="/auth/register?role=PROFESSIONAL"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Registrarme como profesional
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro) => {
            const p = pro.professionalProfile!
            const specialties = p.specialties
              ? p.specialties.split(",").map((s) => s.trim())
              : []

            return (
              <Link
                key={pro.id}
                href={`/professionals/${pro.id}`}
                className="group rounded-2xl border bg-white p-6 transition hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                    {pro.name?.[0] || "?"}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                      {pro.name}
                    </h2>
                    {p.title && (
                      <p className="text-sm text-gray-500">{p.title}</p>
                    )}
                  </div>
                </div>

                {p.bio && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {p.bio}
                  </p>
                )}

                {specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {p.pricePerSession > 0 && (
                  <p className="mt-4 text-sm font-medium text-gray-900">
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
