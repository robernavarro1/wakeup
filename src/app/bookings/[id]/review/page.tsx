import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ReviewForm } from "./ReviewForm"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      professional: true,
      review: true,
    },
  })

  if (!booking || booking.clientId !== session.user.id) notFound()
  if (booking.review) redirect("/dashboard/bookings")

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Valora tu experiencia
        </h1>
        <p className="mt-2 text-gray-600">
          ¿Cómo fue tu sesión con {booking.professional.name}?
        </p>
        <ReviewForm bookingId={id} />
      </div>
    </div>
  )
}
