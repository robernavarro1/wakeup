import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileTabs } from "./ProfileTabs"

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
      userProfile: true,
    },
  })

  if (!user) {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 text-2xl">🪷</span>
        <div>
          <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
          <p className="text-sm text-purple-300/50">
            Tu espacio personal en Wakeup
          </p>
        </div>
      </div>
      <ProfileTabs
        userProfile={user.userProfile}
        professionalProfile={user.professionalProfile}
        userId={user.id}
      />
    </div>
  )
}
