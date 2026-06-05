import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  })

  if (!order) notFound()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">¡Pedido confirmado!</h1>
        <p className="mt-3 text-gray-600">Gracias por tu compra. Recibirás los detalles en tu email.</p>
        <p className="mt-2 text-sm text-gray-500">ID: {orderId}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Seguir comprando
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Ir a mi dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
