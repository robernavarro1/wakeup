import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { orderId } = await searchParams
  if (!orderId) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true },
  })

  if (!order) notFound()
  if (order.userId !== session.user.id) notFound()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">¡Pedido confirmado!</h1>
        <p className="mt-3 text-purple-200/60">Gracias por tu compra. Recibirás los detalles en tu email.</p>
        <p className="mt-2 text-sm text-purple-300/40">ID: {orderId}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/products"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-purple-600/40"
          >
            Seguir comprando
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-purple-400 hover:text-purple-300"
          >
            Ir a mi dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
