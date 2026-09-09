import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const CANCEL_REASONS = [
  "cambio_horario",
  "problemas_personales",
  "enfermedad",
  "ya_no_me_interesa",
  "encontré_algo_mejor",
  "precio",
  "malacomunicación",
  "otro",
]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const { reason, detail } = body as { reason?: string; detail?: string }

  if (!reason || !CANCEL_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Motivo de cancelación no válido" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, professional: true, client: true },
  })

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  }

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
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancelReason: reason,
        cancelDetail: detail || null,
      },
    })

    // Liberar la plaza del servicio
    if (booking.serviceId) {
      const updatedService = await prisma.service.update({
        where: { id: booking.serviceId },
        data: { currentStudents: { decrement: 1 } },
      })
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

          const reasonLabels: Record<string, string> = {
            cambio_horario: "Cambio de horario",
            problemas_personales: "Problemas personales",
            enfermedad: "Enfermedad",
            ya_no_me_interesa: "Ya no me interesa",
            encontré_algo_mejor: "Encontré algo mejor",
            precio: "El precio",
            mala_comunicación: "Mala comunicación con el profesional",
            otro: "Otro motivo",
          }

          await getResend().emails.send({
            from: MAIL_FROM,
            replyTo: MAIL_REPLY_TO,
            to: recipient.email,
            subject: `Reserva cancelada: ${serviceName} — Wakeup`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%"><tr><td align="center" style="padding-bottom:24px;font-size:28px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px">Wakeup</td></tr><tr><td style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827">Reserva cancelada</h1><p style="margin:16px 0 0;font-size:15px;color:#6b7280;line-height:1.5">Hola ${recipient.name || ""},</p><p style="margin:8px 0 0;font-size:15px;color:#6b7280;line-height:1.5">La reserva de <strong>${serviceName}</strong> para el <strong>${dateStr}</strong> ha sido cancelada.</p><table style="margin:20px 0;width:100%"><tr><td style="padding:14px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca"><p style="margin:0;font-size:13px;font-weight:600;color:#991b1b">Motivo: ${reasonLabels[reason] || reason}</p>${detail ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280">${detail}</p>` : ""}</td></tr></table><p style="margin:8px 0 0;font-size:13px;color:#9ca3af">Si tienes preguntas, contacta directamente con ${isClient ? "el profesional" : "el alumno"}.</p></td></tr><tr><td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af">Wakeup — Despertar juntos ☥</td></tr></table></td></tr></table></body></html>`,
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
