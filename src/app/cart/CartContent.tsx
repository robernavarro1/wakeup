"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    amazonUrl: string | null
    image: string | null
    profile: { title: string | null } | null
  }
}

export function CartContent({
  items: initialItems,
  total: initialTotal,
}: {
  items: CartItem[]
  total: number
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [removing, setRemoving] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  async function handleRemove(productId: string) {
    setRemoving(productId)
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
    setRemoving(null)
  }

  async function handleCheckout() {
    setCheckingOut(true)
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cart" }),
    })
    const data = await res.json()
    if (data.url) {
      window.open(data.url, "_blank")
    } else {
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    router.refresh()
    return null
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
        >
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-amber-500/10 text-2xl">
            🛍️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white truncate">{item.product.name}</h3>
            <p className="text-sm text-purple-300/50">{item.product.profile?.title || "Wakeup"}</p>
            <p className="mt-1 text-sm font-semibold text-amber-300">
              {(item.product.price / 100).toFixed(2)} €
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-300/50">x{item.quantity}</span>
            <span className="text-sm font-semibold text-white">
              {((item.product.price * item.quantity) / 100).toFixed(2)} €
            </span>
            <button
              onClick={() => handleRemove(item.product.id)}
              disabled={removing === item.product.id}
              className="rounded-lg p-2 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
            >
              {removing === item.product.id ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <span className="text-base text-purple-300/70">Total</span>
          <span className="text-2xl font-bold text-white">{(total / 100).toFixed(2)} €</span>
        </div>
        <p className="mt-1 text-xs text-purple-300/40">Incluye comisión de plataforma</p>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:opacity-50"
        >
          {checkingOut ? "Procesando..." : "Pagar ahora"}
        </button>
      </div>
    </div>
  )
}
