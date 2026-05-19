import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateZoomLink, calculateFee } from "@/lib/utils"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { professionalId, serviceId, date, durationMinutes, price, notes } =
      await request.json()

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: professionalId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      )
    }

    const platformFee = calculateFee(price)
    const professionalPayout = price - platformFee

    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        professionalId,
        professionalProfileId: profile.id,
        serviceId,
        date: new Date(date),
        durationMinutes,
        price,
        platformFee,
        professionalPayout,
        zoomLink: generateZoomLink(),
        notes,
        status: "CONFIRMED",
      },
    })

    return NextResponse.json({ bookingId: booking.id, success: true })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientBookings: {
        include: { professional: true },
        orderBy: { date: "desc" },
      },
      professionalProfile: {
        include: {
          bookings: {
            include: { client: true },
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
