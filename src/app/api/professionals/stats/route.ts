import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/professionals/stats
 *
 * Estadísticas avanzadas para profesionales con plan BOSQUE.
 * Incluye: demografía de clientes, motivos de cancelación, tendencias.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Verificar que tiene plan BOSQUE
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  if (!profile) {
    return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 })
  }

  const plan = profile.subscription?.plan
  if (plan !== "BOSQUE") {
    return NextResponse.json({ error: "Estadísticas disponibles solo con plan Bosque" }, { status: 403 })
  }

  // Obtener todas las reservas del profesional con info del cliente
  const bookings = await prisma.booking.findMany({
    where: { professionalId: session.user.id },
    include: {
      client: {
        include: { userProfile: true },
      },
      service: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length
  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED").length

  // --- DEMOGRAFÍA ---
  const now = new Date()
  const ageBuckets: Record<string, number> = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56+": 0,
    "No especificado": 0,
  }
  const genderCounts: Record<string, number> = {
    "Hombre": 0,
    "Mujer": 0,
    "No binario": 0,
    "Prefiero no decir": 0,
    "No especificado": 0,
  }
  const cityCounts: Record<string, number> = {}

  for (const booking of bookings) {
    const profile = booking.client.userProfile
    const birthYear = profile?.birthYear
    const gender = profile?.gender
    const city = booking.client.userProfile?.city || (booking.client as any).city || "No especificado"

    if (birthYear) {
      const age = now.getFullYear() - birthYear
      if (age <= 25) ageBuckets["18-25"]++
      else if (age <= 35) ageBuckets["26-35"]++
      else if (age <= 45) ageBuckets["36-45"]++
      else if (age <= 55) ageBuckets["46-55"]++
      else ageBuckets["56+"]++
    } else {
      ageBuckets["No especificado"]++
    }

    if (gender) {
      const key = gender === "male" ? "Hombre"
        : gender === "female" ? "Mujer"
        : gender === "non_binary" ? "No binario"
        : gender === "prefer_not_to_say" ? "Prefiero no decir"
        : "No especificado"
      genderCounts[key]++
    } else {
      genderCounts["No especificado"]++
    }

    if (city && city !== "No especificado") {
      cityCounts[city] = (cityCounts[city] || 0) + 1
    }
  }

  // Top 5 ciudades
  const topCities = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }))

  // --- MOTIVOS DE CANCELACIÓN ---
  const reasonLabels: Record<string, string> = {
    cambio_horario: "Cambio de horario",
    problemas_personales: "Problemas personales",
    enfermedad: "Enfermedad",
    ya_no_me_interesa: "Ya no me interesa",
    encontré_algo_mejor: "Encontré algo mejor",
    precio: "El precio",
    mala_comunicación: "Mala comunicación",
    otro: "Otro",
  }
  const cancelReasonCounts: Record<string, number> = {}
  const cancelDetails: string[] = []

  for (const booking of bookings) {
    if (booking.status === "CANCELLED" && booking.cancelReason) {
      const label = reasonLabels[booking.cancelReason] || booking.cancelReason
      cancelReasonCounts[label] = (cancelReasonCounts[label] || 0) + 1
      if (booking.cancelDetail) {
        cancelDetails.push(booking.cancelDetail)
      }
    }
  }

  const topCancelReasons = Object.entries(cancelReasonCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([reason, count]) => ({ reason, count }))

  // --- SERVICIOS MÁS POPULARES ---
  const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const booking of bookings) {
    if (booking.service) {
      const key = booking.service.id
      if (!serviceCounts[key]) {
        serviceCounts[key] = { name: booking.service.name, count: 0, revenue: 0 }
      }
      serviceCounts[key].count++
      if (booking.status === "COMPLETED") {
        serviceCounts[key].revenue += booking.service.price
      }
    }
  }
  const topServices = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // --- TENDENCIA MENSUAL (últimos 6 meses) ---
  const monthlyData: { month: string; bookings: number; cancellations: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const monthStr = d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
    const monthBookings = bookings.filter(
      (b) => b.createdAt >= d && b.createdAt <= monthEnd
    )
    monthlyData.push({
      month: monthStr,
      bookings: monthBookings.filter((b) => b.status !== "CANCELLED").length,
      cancellations: monthBookings.filter((b) => b.status === "CANCELLED").length,
    })
  }

  // --- TASA DE CANCELACIÓN ---
  const cancelRate = totalBookings > 0
    ? Math.round((cancelledBookings / totalBookings) * 100)
    : 0

  return NextResponse.json({
    summary: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      activeBookings,
      cancelRate,
    },
    demographics: {
      age: ageBuckets,
      gender: genderCounts,
      topCities,
    },
    cancelReasons: topCancelReasons,
    cancelDetails,
    topServices,
    monthlyTrend: monthlyData,
  })
}
