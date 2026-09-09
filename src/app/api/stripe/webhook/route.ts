import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getResend, MAIL_FROM, MAIL_REPLY_TO } from "@/lib/resend"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "")
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const { type, orderId, userId } = (session.metadata || {}) as any

        if (type === "cart" && orderId) {
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
              stripePaymentIntentId: session.payment_intent as string,
            },
          })

          if (userId) {
            await prisma.cartItem
              .deleteMany({ where: { userId } })
              .catch(() => {})
          }
        }

        if (type === "subscription" && userId) {
          const profile = await prisma.professionalProfile.findUnique({
            where: { userId },
          })
          if (profile) {
            const plan = (session.metadata?.plan as string) || "SEMILLA"
            const { PLANS } = await import("@/lib/plans")
            const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.SEMILLA
            const stripeSubId = session.metadata?.stripeSubscriptionId as string

            let paymentMethodId: string | null = null
            try {
              const setupIntentId = session.setup_intent as string | null
              if (setupIntentId) {
                const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
                paymentMethodId = (setupIntent.payment_method as string) || null
              }

              if (paymentMethodId && session.customer) {
                const customerId = session.customer as string

                await stripe.paymentMethods
                  .attach(paymentMethodId, { customer: customerId })
                  .catch(() => {})

                await stripe.customers.update(customerId, {
                  invoice_settings: { default_payment_method: paymentMethodId },
                })

                if (stripeSubId) {
                  await stripe.subscriptions.update(stripeSubId, {
                    default_payment_method: paymentMethodId,
                  })
                }
              }
            } catch (e) {
              console.error("No se pudo asignar la tarjeta a la suscripción:", e)
            }

            let subStatus = "ACTIVE"
            let trialEndsAt: Date | null = null
            if (stripeSubId) {
              try {
                const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
                if (stripeSub.status === "trialing") subStatus = "TRIALING"
                if (stripeSub.trial_end) {
                  trialEndsAt = new Date(stripeSub.trial_end * 1000)
                }
              } catch {}
            }

            await prisma.professionalSubscription.upsert({
              where: { profileId: profile.id },
              update: {
                status: subStatus,
                plan,
                maxCategories: planConfig.maxCategories,
                maxDisciplines: planConfig.maxDisciplines,
                ...(trialEndsAt ? { trialEndsAt } : {}),
              },
              create: {
                profileId: profile.id,
                plan,
                maxCategories: planConfig.maxCategories,
                maxDisciplines: planConfig.maxDisciplines,
                status: subStatus,
                stripeSubscriptionId: stripeSubId || null,
                ...(trialEndsAt ? { trialEndsAt } : {}),
              },
            })

            const usedPromo = (session.metadata?.promoCode as string) || ""
            if (usedPromo) {
              const promo = await prisma.promoCode.findUnique({
                where: { code: usedPromo.toUpperCase().trim() },
              })
              if (promo) {
                const yaRegistrado = await prisma.promoCodeUsage.findUnique({
                  where: {
                    promoCodeId_userId: { promoCodeId: promo.id, userId },
                  },
                })
                if (!yaRegistrado) {
                  await prisma.promoCodeUsage.create({
                    data: { promoCodeId: promo.id, userId },
                  })
                  await prisma.promoCode.update({
                    where: { id: promo.id },
                    data: { usedCount: { increment: 1 } },
                  })
                }
              }
            }
          }
        }

        if (type === "ad_campaign" && userId) {
          const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
          if (profile) {
            const { AD_PLANS } = await import("@/lib/plans")
            const adPlan = (session.metadata?.adPlan as string) || "DESTELLO"
            const planConfig = AD_PLANS[adPlan as keyof typeof AD_PLANS] || AD_PLANS.DESTELLO
            const startDate = new Date()
            const endDate = new Date(startDate.getTime() + planConfig.months * 30 * 24 * 60 * 60 * 1000)
            await prisma.adCampaign.create({
              data: {
                profileId: profile.id,
                plan: adPlan,
                startDate,
                endDate,
                price: planConfig.price,
                active: true,
              },
            })
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const failedIntent = event.data.object as any
        const { orderId } = (failedIntent.metadata || {}) as any
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any
        const subMetadata = sub.metadata || {}
        if (subMetadata.profileId || subMetadata.userId) {
          const profile = subMetadata.profileId
            ? await prisma.professionalProfile.findUnique({ where: { id: subMetadata.profileId } })
            : await prisma.professionalProfile.findUnique({ where: { userId: subMetadata.userId } })
          if (profile) {
            const status = sub.status === "active" ? "ACTIVE"
              : sub.status === "past_due" ? "PAST_DUE"
              : sub.status === "canceled" ? "CANCELLED"
              : "TRIALING"
            await prisma.professionalSubscription.update({
              where: { profileId: profile.id },
              data: { status },
            }).catch(() => {})
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any
        const delMeta = deletedSub.metadata || {}
        if (delMeta.profileId || delMeta.userId) {
          const profile = delMeta.profileId
            ? await prisma.professionalProfile.findUnique({ where: { id: delMeta.profileId } })
            : await prisma.professionalProfile.findUnique({ where: { userId: delMeta.userId } })
          if (profile) {
            await prisma.professionalSubscription.update({
              where: { profileId: profile.id },
              data: { status: "CANCELLED" },
            }).catch(() => {})
          }
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        if (invoice.subscription) {
          const subId = invoice.subscription
          const existing = await prisma.professionalSubscription.findFirst({
            where: { stripeSubscriptionId: subId },
          })
          if (existing) {
            await prisma.professionalSubscription.update({
              where: { id: existing.id },
              data: { status: "ACTIVE" },
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as any
        if (failedInvoice.subscription) {
          const subId = failedInvoice.subscription
          const existing = await prisma.professionalSubscription.findFirst({
            where: { stripeSubscriptionId: subId },
          })
          if (existing) {
            await prisma.professionalSubscription.update({
              where: { id: existing.id },
              data: { status: "PAST_DUE" },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
