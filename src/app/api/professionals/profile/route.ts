import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const profile = await prisma.professionalProfile.update({
      where: { userId: session.user.id },
      data: {
        title: data.title,
        bio: data.bio,
        phone: data.phone,
        city: data.city,
        pricePerSession: data.pricePerSession,
        specialties: data.specialties,
        published: data.published ?? true,
      },
    })

    if (data.services) {
      await prisma.service.deleteMany({
        where: { profileId: profile.id },
      })
      for (const service of data.services) {
        await prisma.service.create({
          data: {
            profileId: profile.id,
            name: service.name,
            description: service.description,
            durationMinutes: service.durationMinutes,
            price: service.price,
          },
        })
      }
    }

    if (data.availabilities) {
      await prisma.availability.deleteMany({
        where: { profileId: profile.id },
      })
      for (const avail of data.availabilities) {
        await prisma.availability.create({
          data: {
            profileId: profile.id,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    )
  }
}
