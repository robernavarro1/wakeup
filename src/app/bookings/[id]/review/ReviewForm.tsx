"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createReview } from "@/lib/actions/review"

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("bookingId", bookingId)
    formData.set("rating", String(rating))
    formData.set("comment", comment)

    try {
      await createReview(formData)
      router.push("/dashboard/bookings")
      router.refresh()
    } catch (err) {
      setError("Error al enviar la valoración")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-purple-300/70">
          Puntuación
        </label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? "text-amber-400" : "text-purple-600/40"
              } hover:text-amber-400`}
              aria-label={`${star} de 5 estrellas`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-300/70">
          Comentario (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-lg border border-purple-500/20 bg-purple-950/60 px-3 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          placeholder="Cuenta tu experiencia..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar valoración"}
      </button>
    </form>
  )
}
