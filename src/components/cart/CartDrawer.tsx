"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface CartItem {
  id: string
  product: { id: string; name: string; price: number; amazonUrl: string | null }
  quantity: number
}

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        setTotal(data.total || 0)
      })
  }, [open])

  async function handleRemove(productId: string) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId)
      setTotal(next.reduce((s, i) => s + i.product.price * i.quantity, 0))
      return next
    })
  }

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cart" }),
    })
    const data = await res.json()
    if (data.url) {
      window.open(data.url, "_blank")
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative text-purple-300/70 hover:text-purple-200">
        Carrito {items.length > 0 && <span className="ml-1 text-xs text-amber-400">({items.length})</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0a0515] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Carrito</h2>
              <button onClick={() => setOpen(false)} className="text-purple-300/50 hover:text-white">✕</button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-purple-300/30">Carrito vacío</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{item.product.name}</p>
                      <p className="text-xs text-purple-300/50">{formatPrice(item.product.price)}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white">
                    <span>Total</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? "Procesando..." : "Pagar ahora"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
