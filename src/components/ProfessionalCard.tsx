"use client"

import Link from "next/link"

interface Pro {
  id: string
  name: string
  title: string
  bio: string
  specialties: string[]
  pricePerSession: number
  city: string
  rating: number
  reviews: number
  category: string
  image?: string
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="inline-flex items-center gap-1 text-amber-400">
      <span className="text-sm">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) return "★"
          if (i === full && half) return "★"
          return "☆"
        }).join("")}
      </span>
      {count !== undefined && (
        <span className="text-xs text-purple-300/70">({count})</span>
      )}
    </span>
  )
}

export function ProfessionalCard({ pro }: { pro: Pro }) {
  const href = pro.id.startsWith("demo")
    ? "/auth/register?role=PROFESSIONAL"
    : `/professionals/${pro.id}`

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]">
      <Link href={href} className="block">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-sm font-bold text-white shadow-lg">
            {pro.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{pro.name}</p>
            <p className="truncate text-sm text-purple-300/80">{pro.title}</p>
            <StarRating rating={pro.rating} count={pro.reviews} />
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-purple-200/70">
          {pro.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pro.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-300"
            >
              {s}
            </span>
          ))}
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-white/70">{pro.city}</span>
        <div className="flex items-center gap-3">
          {pro.pricePerSession > 0 && (
            <span className="font-semibold text-amber-300">
              {pro.pricePerSession / 100} &euro;
            </span>
          )}
          {!pro.id.startsWith("demo") && (
            <Link
              href={`/professionals/${pro.id}/book`}
              className="rounded-lg bg-purple-600/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-500"
            >
              Reservar
            </Link>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-white/30">El pago se realiza directamente con el profesional</p>
    </div>
  )
}
