"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleAdd() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) throw new Error()
      setAdded(true)
      router.refresh()
    } catch {
      setError("Error al agregar al carrito")
    }
    setLoading(false)
  }

  if (added) {
    return (
      <span className="rounded-lg bg-green-600/20 px-4 py-2 text-sm font-semibold text-green-300">
        Agregado ✓
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      <button
        onClick={handleAdd}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Agregando..." : "Agregar al carrito"}
      </button>
    </div>
  )
}
