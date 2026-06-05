import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const sub = profile.subscription
  const trialActive = sub?.status === "TRIALING" && sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date()
  const isActive = sub?.status === "ACTIVE" || sub?.status === "TRIALING"

  return NextResponse.json({
    subscription: sub,
    trialActive: !!trialActive,
    isActive: !!isActive,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  try {
    if (profile.subscription) {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: "Suscripción Wakeup Pro" },
            unit_amount: 999,
          },
          quantity: 1,
        }],
        metadata: { profileId: profile.id, type: "subscription", userId: session.user.id },
        success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
        cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
      })

      return NextResponse.json({ url: checkoutSession.url })
    }

    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.professionalSubscription.upsert({
      where: { profileId: profile.id },
      update: { trialEndsAt, status: "TRIALING" },
      create: { profileId: profile.id, trialEndsAt, status: "TRIALING" },
    })

    return NextResponse.json({ success: true, trialEndsAt, message: "Mes gratis activado" })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Error con la suscripción" }, { status: 500 })
  }
}
