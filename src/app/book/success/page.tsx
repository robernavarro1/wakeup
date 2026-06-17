import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { bookingId } = await searchParams
  if (!bookingId) notFound()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true, clientId: true },
  })

  if (!booking) notFound()
  if (booking.clientId !== session.user.id) notFound()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          ¡Reserva confirmada!
        </h1>
        <p className="mt-3 text-gray-600">
          Recibirás un email con los detalles de tu sesión y el enlace de la
          videollamada.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          ID de reserva: {bookingId}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Ir a mi dashboard
          </Link>
          <Link
            href="/professionals"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Buscar más profesionales
          </Link>
        </div>
      </div>
    </div>
  )
}
