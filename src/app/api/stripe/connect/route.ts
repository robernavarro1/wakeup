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

  return NextResponse.json({
    stripeAccountId: profile.stripeAccountId || null,
    connected: !!profile.stripeAccountId,
  })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

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
        refresh_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
        return_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
        type: "account_onboarding",
      })

      return NextResponse.json({ url: link.url, stripeAccountId: account.id })
    }

    const link = await stripe.accountLinks.create({
      account: profile.stripeAccountId,
      refresh_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
      return_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard/profile`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: link.url, stripeAccountId: profile.stripeAccountId })
  } catch (error: any) {
    console.error("Stripe Connect error:", error)
    const message = error?.type === "StripeInvalidRequestError"
      ? `Stripe: ${error.message}`
      : "Error al configurar pagos. Verifica que STRIPE_SECRET_KEY está configurada correctamente."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
