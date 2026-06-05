import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { amount, bookingId, type = "booking" } = await request.json()
    if (!amount || !bookingId) {
      return NextResponse.json({ error: "Monto y bookingId requeridos" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata: { bookingId, type, userId: session.user.id },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 })
  }
}
