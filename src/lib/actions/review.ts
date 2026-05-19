"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createReview(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")

  const bookingId = formData.get("bookingId") as string
  const rating = parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking || booking.clientId !== session.user.id) {
    throw new Error("No autorizado")
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Solo puedes valorar sesiones confirmadas")
  }

  await prisma.review.create({
    data: {
      bookingId,
      rating,
      comment,
    },
  })

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  })

  revalidatePath("/dashboard/bookings")
  revalidatePath(`/professionals/${booking.professionalId}`)
}
