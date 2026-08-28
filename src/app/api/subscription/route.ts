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

  const { plan, promoCode } = await request.json()

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: "Plan no válido. Elige: SEMILLA, ARBOL o BOSQUE" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) return NextResponse.json({ error: "Crea tu perfil profesional primero" }, { status: 400 })

  const planConfig = PLANS[plan as keyof typeof PLANS]

  let trialDays = planConfig.trialDays
  let promoRecord = null

  if (promoCode) {
    promoRecord = await prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase().trim() },
    })

    if (!promoRecord || !promoRecord.active) {
      return NextResponse.json({ error: "Código promocional no válido" }, { status: 400 })
    }

    if (promoRecord.maxUses && promoRecord.usedCount >= promoRecord.maxUses) {
      return NextResponse.json({ error: "Código agotado" }, { status: 400 })
    }

    const existingUsage = await prisma.promoCodeUsage.findUnique({
      where: { promoCodeId_userId: { promoCodeId: promoRecord.id, userId: session.user.id } },
    })

    if (existingUsage) {
      return NextResponse.json({ error: "Ya has usado este código" }, { status: 400 })
    }

    trialDays = promoRecord.freeMonths * 30
  }

  try {
    let customerId = profile.stripeAccountId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.professionalProfile.update({
        where: { userId: session.user.id },
        data: { stripeAccountId: customerId },
      })
    }

    const product = await stripe.products.create({
      name: `Wakeup — Plan ${planConfig.name}`,
      metadata: { plan },
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: planConfig.monthlyPrice,
      currency: "eur",
      recurring: { interval: "month" },
    })

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      trial_period_days: trialDays,
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      metadata: {
        userId: session.user.id,
        profileId: profile.id,
        plan,
        promoCode: promoRecord?.code || "",
      },
    })

    await prisma.professionalSubscription.upsert({
      where: { profileId: profile.id },
      update: {
        plan,
        maxCategories: planConfig.maxCategories,
        maxDisciplines: planConfig.maxDisciplines,
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: subscription.id,
      },
      create: {
        profileId: profile.id,
        plan,
        maxCategories: planConfig.maxCategories,
        maxDisciplines: planConfig.maxDisciplines,
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: subscription.id,
      },
    })

    if (promoRecord) {
      await prisma.promoCodeUsage.create({
        data: {
          promoCodeId: promoRecord.id,
          userId: session.user.id,
        },
      })

      await prisma.promoCode.update({
        where: { id: promoRecord.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      trialDays,
      message: promoRecord
        ? `${promoRecord.freeMonths} meses gratis con código ${promoRecord.code}`
        : `${trialDays} días de prueba gratis`,
    })
  } catch (error) {
    console.error("Subscription error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error al crear suscripción: ${msg}` }, { status: 500 })
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
    if (sub.status === "CANCELLED") return NextResponse.json({ error: "Ya está cancelada" }, { status: 400 })

    if (sub.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
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
