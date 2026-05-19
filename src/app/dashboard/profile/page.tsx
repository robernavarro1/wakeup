import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./ProfileForm"

export default async function EditProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      professionalProfile: {
        include: {
          services: true,
          availabilities: true,
        },
      },
    },
  })

  if (!user || user.role !== "PROFESSIONAL") {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Editar perfil profesional</h1>
      <p className="mt-1 text-sm text-purple-300/50">
        Completa tu perfil para que los alumnos puedan encontrarte
      </p>
      <ProfileForm profile={user.professionalProfile} userId={user.id} />
    </div>
  )
}
