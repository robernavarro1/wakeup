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
        const { bookingId, type, orderId, userId } = (session.metadata || {}) as any

        if (type === "booking" && bookingId) {
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              stripePaymentIntentId: session.payment_intent as string,
            },
            include: {
              client: true,
              professional: true,
              profile: true,
            },
          })

          const hasEmail = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
          if (hasEmail) {
            const dateStr = booking.date.toLocaleDateString("es-ES", {
              weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })
            const zoomLink = booking.zoomLink || ""
            const priceStr = `${(booking.price / 100).toFixed(2)} €`

            await getResend().emails.send({
              from: MAIL_FROM,
              replyTo: MAIL_REPLY_TO,
              to: booking.client.email,
              subject: "Reserva confirmada — Wakeup",
              html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Reserva confirmada</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Hola ${booking.client.name || ""},</p><p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Tu reserva con <strong>${booking.professional.name || booking.professional.email}</strong> ha sido confirmada.</p><table style="margin:24px 0;width:100%"><tr><td style="padding:16px;background:#f9fafb;border-radius:12px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Fecha</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${dateStr}</td></tr><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Precio</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${priceStr}</td></tr>${zoomLink ? `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Enlace</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right"><a href="${zoomLink}" style="color:#7c3aed">Unirse a videollamada</a></td></tr>` : ""}</table></td></tr></table><a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Ir a mi dashboard</a><p style="margin:24px 0 0;font-size:13px;color:#9ca3af">Gracias por confiar en Wakeup.</p></td></tr></table></td></tr></table></body></html>`,
            })

            await getResend().emails.send({
              from: MAIL_FROM,
              replyTo: MAIL_REPLY_TO,
              to: booking.professional.email,
              subject: "Nueva reserva recibida — Wakeup",
              html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Nueva reserva</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Hola ${booking.professional.name || ""},</p><p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Tienes una nueva reserva confirmada con <strong>${booking.client.name || booking.client.email}</strong>.</p><table style="margin:24px 0;width:100%"><tr><td style="padding:16px;background:#f9fafb;border-radius:12px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Fecha</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${dateStr}</td></tr><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Precio</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${priceStr}</td></tr><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Tu ingreso</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#059669;text-align:right">${(booking.professionalPayout / 100).toFixed(2)} €</td></tr>${zoomLink ? `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Enlace</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right"><a href="${zoomLink}" style="color:#7c3aed">Unirse a videollamada</a></td></tr>` : ""}</table></td></tr></table><a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"}/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Ir a mi dashboard</a><p style="margin:24px 0 0;font-size:13px;color:#9ca3af">Gracias por usar Wakeup.</p></td></tr></table></td></tr></table></body></html>`,
            })
          }
        }

        if (type === "cart" && orderId) {
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
              stripePaymentIntentId: session.payment_intent as string,
            },
            include: {
              orderItems: {
                include: { product: { include: { profile: { select: { stripeAccountId: true } } } } },
              },
            },
          })

          // Ahora que el pago está confirmado, ya se puede vaciar el carrito.
          if (userId) {
            await prisma.cartItem
              .deleteMany({ where: { userId } })
              .catch(() => {})
          }

          const paymentIntentId = session.payment_intent as string
          if (paymentIntentId) {
            for (const item of order.orderItems) {
              if (!item.professionalPayout || !item.profileId) continue
              const stripeAccountId = item.product.profile?.stripeAccountId
              if (!stripeAccountId) continue
              try {
                await stripe.transfers.create({
                  amount: item.professionalPayout,
                  currency: "eur",
                  destination: stripeAccountId,
                  source_transaction: paymentIntentId,
                })
              } catch (e) {
                console.error("Transfer failed for item", item.id, e)
              }
            }
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

            // La sesión de checkout en modo "setup" solo guarda la tarjeta en el
            // cliente. Hay que asignarla explícitamente como método de pago por
            // defecto de la suscripción; de lo contrario, al terminar la prueba
            // gratuita la factura falla y el cobro nunca se llega a realizar.
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
                  .catch(() => {
                    // Ya estaba asociada a este cliente: no es un error.
                  })

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

            // El código promocional se contabiliza aquí y no al iniciar el pago:
            // así, si alguien abandona el checkout, no gasta su único uso.
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
        const { bookingId, orderId } = (failedIntent.metadata || {}) as any
        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
          })
        }
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
