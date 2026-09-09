import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/bookings/[id]/cancel
 *
 * Cancela una reserva. Tanto el cliente como el profesional pueden cancelar.
 * Si la reserva tenía un servicio, se libera la plaza.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, professional: true, client: true },
  })

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  }

  // Solo el cliente o el profesional pueden cancelar
  if (booking.clientId !== session.user.id && booking.professionalId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 400 })
  }

  if (booking.status === "COMPLETED") {
    return NextResponse.json({ error: "No se puede cancelar una sesión ya completada" }, { status: 400 })
  }

  try {
    // Cancelar la reserva
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    })

    // Liberar la plaza del servicio
    if (booking.serviceId) {
      const updatedService = await prisma.service.update({
        where: { id: booking.serviceId },
        data: { currentStudents: { decrement: 1 } },
      })

      // Si el servicio estaba desactivado por estar lleno, reactivarlo
      if (updatedService.currentStudents < updatedService.maxStudents && !updatedService.active) {
        await prisma.service.update({
          where: { id: booking.serviceId },
          data: { active: true },
        })
      }
    }

    // Notificar al otro usuario
    try {
      const { getResend, MAIL_FROM, MAIL_REPLY_TO } = await import("@/lib/resend")
      const hasEmail = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"

      if (hasEmail) {
        const isClient = booking.clientId === session.user.id
        const recipient = isClient ? booking.professional : booking.client

        if (recipient?.email) {
          const serviceName = booking.service?.name || "Sesión"
          const dateStr = booking.date.toLocaleDateString("es-ES", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })

          await getResend().emails.send({
            from: MAIL_FROM,
            replyTo: MAIL_REPLY_TO,
            to: recipient.email,
            subject: `Reserva cancelada: ${serviceName} — Wakeup`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Reserva cancelada</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Hola ${recipient.name || ""},</p><p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.5">La reserva de <strong>${serviceName}</strong> para el <strong>${dateStr}</strong> ha sido cancelada.</p><p style="margin:12px 0 0;font-size:13px;color:#9ca3af">Si tienes preguntas, contacta directamente con ${isClient ? "el profesional" : "el alumno"}.</p></td></tr><tr><td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af">Wakeup — Despertar juntos ☥</td></tr></table></td></tr></table></body></html>`,
          })
        }
      }
    } catch (e) {
      console.error("Cancel notification email failed:", e)
    }

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada. La plaza ha sido liberada.",
    })
  } catch (error: any) {
    console.error("Cancel error:", error)
    return NextResponse.json(
      { error: `Error al cancelar: ${error?.message || "Error desconocido"}` },
      { status: 500 }
    )
  }
}
