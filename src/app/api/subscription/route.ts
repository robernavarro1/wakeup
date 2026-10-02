import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { PLANS, AD_PLANS } from "@/lib/plans"

/**
 * Devuelve la tarifa mensual del plan en Stripe, reutilizándola si ya existe.
 */
async function getOrCreatePrice(
  plan: string,
  planConfig: { name: string; monthlyPrice: number }
) {
  const lookupKey = `wakeup_${plan.toLowerCase()}_mensual`

  const existing = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })

  if (existing.data.length > 0) return existing.data[0]

  const product = await stripe.products.create({
    name: `Wakeup — Plan ${planConfig.name}`,
    metadata: { plan },
  })

  return stripe.prices.create({
    product: product.id,
    unit_amount: planConfig.monthlyPrice,
    currency: "eur",
    recurring: { interval: "month" },
    lookup_key: lookupKey,
  })
}

/**
 * Crea (o reutiliza) el cliente de Stripe y registra un estado PENDING_CARD
 * en la base de datos local. La suscripción solo se activa cuando el webhook
 * confirma que la tarjeta ha sido adjuntada correctamente.
 *
 * Modelo seguido por Netflix, Spotify, Calendly, Mindvalley, etc:
 * la tarjeta es obligatoria desde el primer momento, incluso con prueba
 * gratis o código promocional.
 */
async function startSubscriptionFlow(
  userId: string,
  userEmail: string | null | undefined,
  userName: string | null | undefined,
  plan: string,
  promoRecord: { code: string; freeMonths: number } | null
) {
  const planConfig = PLANS[plan as keyof typeof PLANS]
  const trialDays = promoRecord ? promoRecord.freeMonths * 30 : planConfig.trialDays

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
  })
  if (!profile) {
    return { error: "Crea tu perfil profesional primero", status: 400 }
  }

  // Crear cliente de Stripe si no existe
  let customerId = profile.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail || undefined,
      name: userName || undefined,
      metadata: { userId },
    })
    customerId = customer.id
    await prisma.professionalProfile.update({
      where: { userId },
      data: { stripeCustomerId: customerId },
    })
  }

  // Comprobar si ya tiene una suscripción activa con tarjeta
  const existingSub = await prisma.professionalSubscription.findUnique({
    where: { profileId: profile.id },
  })

  if (
    existingSub &&
    existingSub.hasCard &&
    (existingSub.status === "ACTIVE" || existingSub.status === "TRIALING")
  ) {
    if (existingSub.plan === plan) {
      return { error: "Ya tienes este plan activo", status: 400 }
    }
    return {
      error: "Ya tienes una suscripción activa. Cancela la actual primero.",
      status: 400,
    }
  }

  // Crear suscripción en Stripe (modo subscription — Stripe exige tarjeta)
  const price = await getOrCreatePrice(plan, planConfig)

  const stripeSub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    trial_period_days: trialDays,
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
    metadata: {
      userId,
      profileId: profile.id,
      plan,
      promoCode: promoRecord?.code || "",
    },
  })

  // Escribir la suscripción local en estado PENDING_CARD.
  // NO se activa hasta que el webhook confirme la tarjeta.
  await prisma.professionalSubscription.upsert({
    where: { profileId: profile.id },
    update: {
      plan,
      maxCategories: planConfig.maxCategories,
      maxDisciplines: planConfig.maxDisciplines,
      status: "PENDING_CARD",
      stripeSubscriptionId: stripeSub.id,
      hasCard: false,
      paymentMethodId: null,
      trialEndsAt: null,
    },
    create: {
      profileId: profile.id,
      plan,
      maxCategories: planConfig.maxCategories,
      maxDisciplines: planConfig.maxDisciplines,
      status: "PENDING_CARD",
      stripeSubscriptionId: stripeSub.id,
      hasCard: false,
      paymentMethodId: null,
    },
  })

  // Crear sesión de Stripe Checkout en modo "subscription".
  // Stripe exige introducir una tarjeta válida para completar el checkout,
  // incluso cuando hay un periodo de prueba gratuito.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wakeup-app.com"

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        userId,
        profileId: profile.id,
        plan,
        promoCode: promoRecord?.code || "",
      },
    },
    success_url: `${baseUrl}/dashboard/profile?subscription=success`,
    cancel_url: `${baseUrl}/dashboard/profile?subscription=cancelled`,
    metadata: {
      userId,
      profileId: profile.id,
      plan,
      type: "subscription",
      promoCode: promoRecord?.code || "",
    },
  })

  return {
    success: true,
    url: checkoutSession.url,
    subscriptionId: stripeSub.id,
    trialDays,
    message: promoRecord
      ? `${promoRecord.freeMonths} meses gratis con código ${promoRecord.code} — introduce tu tarjeta para activar`
      : `${trialDays} días de prueba gratis — introduce tu tarjeta para continuar`,
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  let sub = null
  let trialActive = false
  let isActive = false
  let planInfo = null
  let trialUsed = false
  let hasCard = false
  let needsCard = false

  if (profile?.subscription) {
    sub = profile.subscription
    hasCard = sub.hasCard

    trialActive =
      sub.status === "TRIALING" && sub.trialEndsAt
        ? new Date(sub.trialEndsAt) > new Date()
        : false

    // Solo activo si tiene tarjeta Y está en período válido
    isActive =
      sub.hasCard &&
      (sub.status === "ACTIVE" || trialActive)

    needsCard = !sub.hasCard
    planInfo = PLANS[sub.plan as keyof typeof PLANS] || null
    trialUsed = sub.status === "CANCELLED"
  }

  return NextResponse.json({
    subscription: sub,
    trialActive,
    isActive,
    trialUsed,
    hasCard,
    needsCard,
    planInfo,
    plans: PLANS,
    adPlans: AD_PLANS,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { plan, promoCode } = await request.json()

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: "Plan no válido" }, { status: 400 })
  }

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

    const yaUsado = await prisma.promoCodeUsage.findUnique({
      where: {
        promoCodeId_userId: { promoCodeId: promoRecord.id, userId: session.user.id },
      },
    })

    if (yaUsado) {
      return NextResponse.json(
        { error: "Ya has usado este código promocional" },
        { status: 400 }
      )
    }
  }

  try {
    const result = await startSubscriptionFlow(
      session.user.id,
      session.user.email,
      session.user.name,
      plan,
      promoRecord
    )
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Subscription error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error al crear suscripción: ${msg}` }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { plan, promoCode } = await request.json()

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: "Plan no válido" }, { status: 400 })
  }

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

    const yaUsado = await prisma.promoCodeUsage.findUnique({
      where: {
        promoCodeId_userId: { promoCodeId: promoRecord.id, userId: session.user.id },
      },
    })

    if (yaUsado) {
      return NextResponse.json(
        { error: "Ya has usado este código promocional" },
        { status: 400 }
      )
    }
  }

  try {
    const result = await startSubscriptionFlow(
      session.user.id,
      session.user.email,
      session.user.name,
      plan,
      promoRecord
    )
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Subscription PUT error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 })
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
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId, { prorate: false }).catch(() => {})
    }

    await prisma.professionalSubscription.update({
      where: { profileId: profile.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true, message: "Suscripción cancelada. Puedes contratar un nuevo plan cuando quieras." })
  } catch (error) {
    console.error("Subscription DELETE error:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error al cancelar: ${msg}` }, { status: 500 })
  }
}
