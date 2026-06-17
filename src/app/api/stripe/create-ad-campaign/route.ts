import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { AD_PLANS } from "@/lib/plans"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { adPlan } = await request.json()

  if (!adPlan || !AD_PLANS[adPlan as keyof typeof AD_PLANS]) {
    return NextResponse.json({ error: "Plan publicitario no válido" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const planConfig = AD_PLANS[adPlan as keyof typeof AD_PLANS]

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Wakeup - Publicidad ${planConfig.name} (${planConfig.label})` },
          unit_amount: planConfig.price,
        },
        quantity: 1,
      }],
      metadata: {
        profileId: profile.id,
        type: "ad_campaign",
        userId: session.user.id,
        adPlan,
      },
      success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
      cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Ad campaign error:", error)
    return NextResponse.json({ error: "Error al crear campaña publicitaria" }, { status: 500 })
  }
}
