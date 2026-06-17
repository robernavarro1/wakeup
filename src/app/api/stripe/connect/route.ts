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
  if (profile.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(profile.stripeAccountId)
      detailsSubmitted = account.details_submitted
    } catch {
      // account might be invalid
    }
  }

  return NextResponse.json({
    stripeAccountId: profile.stripeAccountId || null,
    connected: !!profile.stripeAccountId && detailsSubmitted,
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
    if (!profile.stripeAccountId) {
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
    }

    const link = await stripe.accountLinks.create({
      account: profile.stripeAccountId,
      refresh_url: `${origin}/dashboard/profile`,
      return_url: `${origin}/dashboard/profile`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: link.url, stripeAccountId: profile.stripeAccountId })
  } catch (error: any) {
    console.error("Stripe Connect error:", error?.type, error?.message, error?.code, error?.param)
    const message = `Error de Stripe: ${error?.message || error?.code || "Error desconocido. Verifica STRIPE_SECRET_KEY."}`
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
