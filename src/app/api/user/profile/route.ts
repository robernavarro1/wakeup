import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { interests, disciplines, level, bio, goals, birthYear, gender, city } = body

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: { interests, disciplines, level, bio, goals, birthYear, gender, city },
    create: {
      userId: session.user.id,
      interests,
      disciplines,
      level,
      bio,
      goals,
      birthYear,
      gender,
      city,
    },
  })

  return NextResponse.json(profile)
}
