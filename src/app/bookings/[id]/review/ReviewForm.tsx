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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Puntuación
        </label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-amber-400" : "text-gray-300"
              } hover:text-amber-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comentario (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Cuenta tu experiencia..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar valoración"}
      </button>
    </form>
  )
}
