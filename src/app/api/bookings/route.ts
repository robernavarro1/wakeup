import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientBookings: {
        include: { professional: true, profile: true, review: true },
        orderBy: { date: "desc" },
      },
      professionalProfile: {
        include: {
          bookings: {
            include: { client: true, profile: true, review: true },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const bookings = user.clientBookings
  const proBookings = user.professionalProfile?.bookings || []

  return NextResponse.json({ bookings, proBookings })
}
