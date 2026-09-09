import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

/**
 * POST /api/stripe/create-checkout-session
 *
 * Crea una reserva directa sin pasar por Stripe. El profesional recibe una
 * notificación y el cliente ve confirmada su reserva. El pago se gestiona
 * directamente entre cliente y profesional.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(`checkout:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas peticiones. Espera un minuto." }, { status: 429 })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { professionalId, serviceId, date, durationMinutes, notes, type = "booking" } = await request.json()

    if (type === "cart") {
      return NextResponse.json({ error: "Las compras se gestionan aparte" }, { status: 400 })
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: professionalId },
      include: { services: true },
    })
    if (!profile) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
    }

    let serviceName = "Sesión"
    let serviceMaxStudents = 1
    let serviceMode = "IN_PERSON"
    let serviceLocation: string | null = null
    let serviceVirtualLink: string | null = null

    if (serviceId) {
      const service = profile.services.find((s) => s.id === serviceId)
      if (!service) {
        return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      }
      if (!service.active) {
        return NextResponse.json({ error: "Este servicio no está disponible" }, { status: 400 })
      }
      if (service.currentStudents >= service.maxStudents) {
        return NextResponse.json({ error: "Este servicio está completo. No quedan plazas." }, { status: 400 })
      }
      serviceName = service.name
      serviceMaxStudents = service.maxStudents
      serviceMode = service.mode
      serviceLocation = service.location
      serviceVirtualLink = service.virtualLink
    }

    const bookingDate = new Date(date)

    if (bookingDate.getTime() < Date.now() - 60000) {
      return NextResponse.json({ error: "No puedes reservar en el pasado" }, { status: 400 })
    }

    if (professionalId === session.user.id) {
      return NextResponse.json({ error: "No puedes reservar contigo mismo" }, { status: 400 })
    }

    // Comprobar que no se ha superado la capacidad
    if (serviceId) {
      const service = profile.services.find((s) => s.id === serviceId)
      if (service && service.currentStudents >= service.maxStudents) {
        return NextResponse.json({ error: "No quedan plazas disponibles para este servicio" }, { status: 400 })
      }
    }

    // Comprobar que el cliente no tenga ya una reserva activa para este servicio
    if (serviceId) {
      const existingBooking = await prisma.booking.findFirst({
        where: {
          clientId: session.user.id,
          serviceId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      })
      if (existingBooking) {
        return NextResponse.json({ error: "Ya tienes una reserva activa para este servicio" }, { status: 400 })
      }
    } else {
      // Sin servicio asignado: no permitir dos reservas el mismo día con el mismo profesional
      const dayStart = new Date(bookingDate); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(bookingDate); dayEnd.setHours(23, 59, 59, 999)
      const existingSameDay = await prisma.booking.findFirst({
        where: {
          clientId: session.user.id,
          professionalId,
          date: { gte: dayStart, lte: dayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      })
      if (existingSameDay) {
        return NextResponse.json({ error: "Ya tienes una reserva con este profesional para este día" }, { status: 400 })
      }
    }

    // Crear la reserva directamente
    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        professionalId,
        professionalProfileId: profile.id,
        serviceId: serviceId || undefined,
        date: bookingDate,
        durationMinutes: durationMinutes || 60,
        notes: notes || undefined,
        status: "CONFIRMED",
      },
    })

    // Incrementar el contador de alumnos del servicio
    if (serviceId) {
      const updatedService = await prisma.service.update({
        where: { id: serviceId },
        data: { currentStudents: { increment: 1 } },
      })

      // Si el servicio se ha llenado, marcarlo como inactivo
      if (updatedService.currentStudents >= updatedService.maxStudents) {
        await prisma.service.update({
          where: { id: serviceId },
          data: { active: false },
        })
      }
    }

    // Notificar al profesional por email
    try {
      const { getResend, MAIL_FROM, MAIL_REPLY_TO } = await import("@/lib/resend")
      const hasEmail = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"

      if (hasEmail && profile) {
        const dateStr = bookingDate.toLocaleDateString("es-ES", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
        const hourStr = bookingDate.toLocaleTimeString("es-ES", {
          hour: "2-digit", minute: "2-digit",
        })

        const clientUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { userProfile: true },
        })

        const clientName = clientUser?.name || clientUser?.email || "Cliente"
        const clientSpecialties = clientUser?.userProfile?.disciplines || ""
        const clientGoals = clientUser?.userProfile?.goals || ""

        const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"

        await getResend().emails.send({
          from: MAIL_FROM,
          replyTo: MAIL_REPLY_TO,
          to: profile.userId,
          subject: `Nueva reserva: ${serviceName} — Wakeup`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Nueva reserva</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Hola,</p><p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.5"><strong>${clientName}</strong> se ha reservado en <strong>${serviceName}</strong>.</p><table style="margin:24px 0;width:100%"><tr><td style="padding:16px;background:#f9fafb;border-radius:12px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Fecha</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${dateStr}</td></tr><tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Hora</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${hourStr}</td></tr>${serviceMode === "VIRTUAL" && serviceVirtualLink ? `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Enlace</td><td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right"><a href="${serviceVirtualLink}" style="color:#7c3aed">Unirse</a></td></tr>` : ""}${serviceMode === "IN_PERSON" && serviceLocation ? `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Lugar</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#111827;text-align:right">${serviceLocation}</td></tr>` : ""}</table></td></tr></table><table style="margin:16px 0;width:100%"><tr><td style="padding:16px;background:#faf5ff;border-radius:12px;border:1px solid #e9d5ff"><p style="margin:0;font-size:13px;font-weight:600;color:#7c3aed">Sobre el cliente</p>${clientSpecialties ? `<p style="margin:6px 0 0;font-size:13px;color:#6b7280"><strong>Disciplinas de interés:</strong> ${clientSpecialties}</p>` : ""}${clientGoals ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>Qué busca:</strong> ${clientGoals}</p>` : ""}${!clientSpecialties && !clientGoals ? `<p style="margin:6px 0 0;font-size:13px;color:#6b7280">El cliente aún no ha completado su perfil.</p>` : ""}</td></tr></table><a href="${appUrl}/dashboard/bookings" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;margin-top:20px">Ver reservas</a></td></tr><tr><td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af">Wakeup — Despertar juntos ☥</td></tr></table></td></tr></table></body></html>`,
        })

        // Si el servicio se llenó, enviar email aparte
        const finalService = await prisma.service.findUnique({ where: { id: serviceId || "" } })
        if (finalService && finalService.currentStudents >= finalService.maxStudents) {
          await getResend().emails.send({
            from: MAIL_FROM,
            replyTo: MAIL_REPLY_TO,
            to: profile.userId,
            subject: `¡${serviceName} está completo! — Wakeup`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">¡Servicio completo!</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Tu servicio <strong>${serviceName}</strong> ha alcanzado el número máximo de plazas (${serviceMaxStudents}). Se ha cerrado automáticamente.</p><p style="margin:12px 0 0;font-size:13px;color:#9ca3af">Puedes abrir un nuevo turno o duplicar el servicio desde tu panel de control.</p></td></tr><tr><td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af">Wakeup — Despertar juntos ☥</td></tr></table></td></tr></table></body></html>`,
          })
        }
      }
    } catch (e) {
      console.error("Notification email failed:", e)
    }

    const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: `Reserva confirmada en ${serviceName}`,
      redirectUrl: `${appUrl}/dashboard/bookings`,
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
  }
}
