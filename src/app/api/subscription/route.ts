import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { PLANS, AD_PLANS } from "@/lib/plans"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  let sub = null, trialActive = false, isActive = false, planInfo = null, trialUsed = false

  if (profile?.subscription) {
    sub = profile.subscription
    trialActive = sub.status === "TRIALING" && sub.trialEndsAt ? new Date(sub.trialEndsAt) > new Date() : false
    isActive = sub.status === "ACTIVE" || trialActive
    planInfo = PLANS[sub.plan as keyof typeof PLANS] || null
    trialUsed = sub.status === "CANCELLED"
  }

  return NextResponse.json({ subscription: sub, trialActive, isActive, trialUsed, planInfo, plans: PLANS, adPlans: AD_PLANS })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { plan } = await request.json()

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: "Plan no válido. Elige: SEMILLA, ARBOL o BOSQUE" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) return NextResponse.json({ error: "Crea tu perfil profesional primero" }, { status: 400 })

  try {
    const planConfig = PLANS[plan as keyof typeof PLANS]

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Wakeup - Plan ${planConfig.name}` },
          unit_amount: planConfig.price,
        },
        quantity: 1,
      }],
      metadata: {
        profileId: profile.id,
        type: "subscription",
        userId: session.user.id,
        plan,
      },
      success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
      cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Error con la suscripción" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { plan } = await request.json()

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Plan no válido. Elige: SEMILLA, ARBOL o BOSQUE" }, { status: 400 })
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) return NextResponse.json({ error: "Crea tu perfil profesional primero" }, { status: 400 })

    const existing = await prisma.professionalSubscription.findUnique({ where: { profileId: profile.id } })
    if (existing?.status === "CANCELLED") {
      return NextResponse.json({ error: "Ya has usado tu prueba gratis. Solo puedes pagar una suscripción." }, { status: 400 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    const trialEndsAt = new Date(Date.now() + planConfig.trialDays * 24 * 60 * 60 * 1000)

    await prisma.professionalSubscription.upsert({
      where: { profileId: profile.id },
      update: {
        plan,
        maxCategories: planConfig.maxCategories,
        maxDisciplines: planConfig.maxDisciplines,
        status: "TRIALING",
        trialEndsAt,
      },
      create: {
        profileId: profile.id,
        plan,
        maxCategories: planConfig.maxCategories,
        maxDisciplines: planConfig.maxDisciplines,
        status: "TRIALING",
        trialEndsAt,
      },
    })

    return NextResponse.json({ success: true, trialEndsAt, message: `${planConfig.trialDays} días gratis activados para el plan ${planConfig.name}` })
  } catch (error) {
    console.error("Subscription PUT error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error al activar el plan: ${msg}` }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

    const sub = await prisma.professionalSubscription.findUnique({
      where: { profileId: profile.id },
    })

    if (!sub) return NextResponse.json({ error: "No tienes una suscripción activa" }, { status: 400 })

    if (sub.status === "CANCELLED") {
      return NextResponse.json({ error: "Tu suscripción ya está cancelada" }, { status: 400 })
    }

    await prisma.professionalSubscription.update({
      where: { profileId: profile.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true, message: "Suscripción cancelada" })
  } catch (error) {
    console.error("Subscription DELETE error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error al cancelar: ${msg}` }, { status: 500 })
  }
}
