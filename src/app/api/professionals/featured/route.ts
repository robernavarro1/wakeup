import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEMO_FEATURED = [
  { id: "demo-luna", title: "Luna Fernández — Sanación Energética", city: "Barcelona", specialties: "Reiki Usui, Meditación guiada, Sanación con cuencos tibetanos, Limpieza de chakras", user: { name: "Luna Fernández", image: null } },
  { id: "demo-samadhi", title: "Centro de Yoga Samadhi", city: "Madrid", specialties: "Hatha Yoga, Vinyasa Flow, Meditación mindfulness, Cursos de formación de profesores", user: { name: "Centro Samadhi", image: null } },
  { id: "demo-carlos", title: "Carlos Montoya — Astrólogo", city: "Valencia", specialties: "Astrología predictiva, Carta natal evolutiva, Sinastría de pareja, Revolución solar", user: { name: "Carlos Montoya", image: null } },
  { id: "demo-tona", title: "Temazcal Tona — Ceremonias Ancestrales", city: "Tenerife", specialties: "Temazcal medicinal, Ceremonias de cacao, Medicina ancestral mexicana, Círculos de palabra", user: { name: "Temazcal Tona", image: null } },
  { id: "demo-isabel", title: "Isabel Torres — Tarot Terapéutico", city: "Sevilla", specialties: "Tarot evolutivo, Registros akáshicos, Canalización de guías, Péndulo hebreo", user: { name: "Isabel Torres", image: null } },
  { id: "demo-constelaciones", title: "Asociación de Constelaciones Familiares", city: "Bilbao", specialties: "Constelaciones individuales y grupales, Talleres de constelaciones, Terapia sistémica", user: { name: "Asoc. Constelaciones", image: null } },
  { id: "demo-marta", title: "Marta Gálvez — Hipnoterapeuta", city: "Granada", specialties: "Hipnosis clínica, Regresión a vidas pasadas, Terapia de Línea de Tiempo, Liberación emocional", user: { name: "Marta Gálvez", image: null } },
]

export async function GET() {
  const campaigns = await prisma.adCampaign.findMany({
    where: {
      active: true,
      endDate: { gte: new Date() },
    },
    include: {
      profile: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  if (campaigns.length > 0) {
    const adProfiles = campaigns
      .filter((c) => c.profile.published)
      .map((c) => ({
        id: c.profile.userId,
        title: c.profile.title,
        city: c.profile.city,
        specialties: c.profile.specialties,
        user: c.profile.user,
      }))
    if (adProfiles.length > 0) return NextResponse.json({ profiles: adProfiles })
  }

  return NextResponse.json({ profiles: DEMO_FEATURED })
}
