import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { calculateFee, generateZoomLink } from "@/lib/utils"
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { professionalId, serviceId, date, durationMinutes, price, notes, type = "booking" } = await request.json()

    if (type === "booking") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId: professionalId },
        include: { services: true },
      })
      if (!profile) {
        return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
      }

      let actualPrice: number
      if (serviceId) {
        const service = profile.services.find((s) => s.id === serviceId)
        if (!service) {
          return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
        }
        actualPrice = service.price
      } else {
        actualPrice = profile.pricePerSession
      }

      const bookingDate = new Date(date)
      const bookingEnd = new Date(bookingDate.getTime() + (durationMinutes || 60) * 60000)

      const dayStart = new Date(bookingDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(bookingDate)
      dayEnd.setHours(23, 59, 59, 999)

      const existingBookings = await prisma.booking.findMany({
        where: {
          professionalId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: dayStart, lte: dayEnd },
        },
      })

      const hasConflict = existingBookings.some((b) => {
        const bStart = b.date.getTime()
        const bEnd = bStart + (b.durationMinutes || 60) * 60000
        return bStart < bookingEnd.getTime() && bEnd > bookingDate.getTime()
      })
      if (hasConflict) {
        return NextResponse.json({ error: "El profesional ya tiene una reserva en ese horario" }, { status: 409 })
      }

      const platformFee = calculateFee(actualPrice)
      const professionalPayout = actualPrice - platformFee

      const booking = await prisma.booking.create({
        data: {
          clientId: session.user.id,
          professionalId,
          professionalProfileId: profile.id,
          serviceId: serviceId || undefined,
          date: bookingDate,
          durationMinutes,
          price: actualPrice,
          platformFee,
          professionalPayout,
          zoomLink: generateZoomLink(),
          notes: notes || undefined,
          status: "PENDING",
        },
      })

      const sessionParams: any = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: `Reserva con ${profile.title || "profesional"}` },
            unit_amount: actualPrice,
          },
          quantity: 1,
        }],
        metadata: {
          bookingId: booking.id,
          type: "booking",
          userId: session.user.id,
        },
        success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/book/success?bookingId=${booking.id}`,
        cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/professionals/${professionalId}/book`,
      }

      if (profile.stripeAccountId) {
        sessionParams.payment_intent_data = {
          transfer_data: {
            destination: profile.stripeAccountId,
            amount: professionalPayout,
          },
        }
      }

      const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

      return NextResponse.json({ url: checkoutSession.url })
    }

    if (type === "cart") {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
      })

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
      }

      const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const platformFee = calculateFee(total)

      const orderItemsData = cartItems.map((item) => {
        const itemTotal = item.product.price * item.quantity
        const itemFee = Math.round(itemTotal * (PLATFORM_FEE_PERCENT / 100))
        return {
          productId: item.productId,
          profileId: item.product.profileId,
          quantity: item.quantity,
          price: item.product.price,
          professionalPayout: itemTotal - itemFee,
        }
      })

      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          total,
          platformFee,
          status: "PENDING",
          orderItems: { create: orderItemsData },
        },
      })

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: "eur",
            product_data: { name: item.product.name },
            unit_amount: item.product.price,
          },
          quantity: item.quantity,
        })),
        metadata: {
          orderId: order.id,
          type: "cart",
          userId: session.user.id,
        },
        success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/orders/success?orderId=${order.id}`,
        cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/products`,
      })

      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })

      return NextResponse.json({ url: checkoutSession.url })
    }

    return NextResponse.json({ error: "Tipo no válido" }, { status: 400 })
  } catch (error) {
    console.error("Checkout session error:", error)
    return NextResponse.json({ error: "Error al crear sesión de pago" }, { status: 500 })
  }
}
