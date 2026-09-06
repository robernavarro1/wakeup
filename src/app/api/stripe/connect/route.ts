import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  let detailsSubmitted = false
  const accountId = profile.stripeAccountId

  // Solo consultamos si es una cuenta Connect real (empieza con acct_).
  // Si hay un cus_ residual de un bug anterior, lo limpiamos.
  if (accountId?.startsWith("acct_")) {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      detailsSubmitted = account.details_submitted
    } catch {
      // cuenta inválida o eliminada
    }
  } else if (accountId && !accountId.startsWith("acct_")) {
    // Residuo de un bug anterior: cus_ guardado en stripeAccountId.
    // Si no hay stripeCustomerId aún, lo movemos; si ya hay, borramos el incorrecto.
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: {
        stripeCustomerId: profile.stripeCustomerId || accountId,
        stripeAccountId: null,
      },
    })
  }

  return NextResponse.json({
    stripeAccountId: detailsSubmitted ? accountId : null,
    connected: detailsSubmitted,
    detailsSubmitted,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const origin = request.headers.get("origin") || process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"

  try {
    const existingAccountId = profile.stripeAccountId

    // Si ya hay una cuenta Connect válida, reutilizarla.
    if (existingAccountId?.startsWith("acct_")) {
      const link = await stripe.accountLinks.create({
        account: existingAccountId,
        refresh_url: `${origin}/dashboard/profile`,
        return_url: `${origin}/dashboard/profile`,
        type: "account_onboarding",
      })

      return NextResponse.json({ url: link.url, stripeAccountId: existingAccountId })
    }

    // Si el campo contiene algo que no es acct_ (ej: un cus_ residual), limpiarlo.
    if (existingAccountId && !existingAccountId.startsWith("acct_")) {
      await prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId: null },
      })
    }

    // Crear nueva cuenta Connect.
    const account = await stripe.accounts.create({
      type: "express",
      country: "ES",
      email: session.user.email ?? undefined,
      capabilities: { transfers: { requested: true } },
    })

    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { stripeAccountId: account.id },
    })

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/profile`,
      return_url: `${origin}/dashboard/profile`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: link.url, stripeAccountId: account.id })
  } catch (error: any) {
    console.error("Stripe Connect error:", error?.type, error?.message, error?.code, error?.param)
    const message = `Error de Stripe: ${error?.message || error?.code || "Error desconocido. Verifica STRIPE_SECRET_KEY."}`
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
