"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  active: boolean
  amazonUrl: string | null
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", price: "", image: "", category: "" })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      const res = await fetch(`/api/products/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      if (res.ok) {
        setEditing(null)
        setForm({ name: "", description: "", price: "", image: "", category: "" })
        router.refresh()
      }
    } else {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      if (res.ok) {
        setCreating(false)
        setForm({ name: "", description: "", price: "", image: "", category: "" })
        router.refresh()
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar producto?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    router.refresh()
  }

  function startEdit(p: Product) {
    setEditing(p.id)
    setForm({ name: p.name, description: p.description || "", price: (p.price / 100).toString(), image: p.image || "", category: p.category || "" })
  }

  function startCreate() {
    setCreating(true)
    setForm({ name: "", description: "", price: "", image: "", category: "" })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis productos</h1>
          <p className="mt-1 text-sm text-purple-300/50">Gestiona los productos que vendes en Wakeup</p>
        </div>
        <button onClick={startCreate} className="rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25">
          + Nuevo producto
        </button>
      </div>

      {(creating || editing) && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">{editing ? "Editar producto" : "Nuevo producto"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400 focus:outline-none" required />
            <input placeholder="Precio (€)" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400 focus:outline-none" required />
            <input placeholder="URL de imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400 focus:outline-none sm:col-span-2" />
            <input placeholder="Categoría (yoga, meditacion, terapias, tarot, crecimiento...)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400 focus:outline-none sm:col-span-2" />
            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm text-white placeholder-purple-300/30 focus:border-purple-400 focus:outline-none sm:col-span-2" rows={3} />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500">Guardar</button>
            <button type="button" onClick={() => { setEditing(null); setCreating(false) }} className="rounded-lg border border-purple-500/30 px-5 py-2 text-sm text-purple-300 hover:bg-purple-500/10">Cancelar</button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-purple-500/30 p-12 text-center">
          <p className="text-purple-300/50">No tienes productos aún. Crea tu primer producto para vender en Wakeup.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/80 to-indigo-950/60 p-5 shadow-xl">
              {product.image && (
                <img src={product.image} alt={product.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
              )}
              <h3 className="font-semibold text-white">{product.name}</h3>
              <p className="mt-1 text-sm text-purple-300/50">{product.description}</p>
              <p className="mt-2 text-lg font-bold text-amber-400">{(product.price / 100).toFixed(2)} €</p>
              {product.category && <p className="mt-1 text-xs text-purple-300/30">{product.category}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(product)} className="rounded-lg bg-purple-600/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600">Editar</button>
                <button onClick={() => handleDelete(product.id)} className="rounded-lg bg-red-600/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
