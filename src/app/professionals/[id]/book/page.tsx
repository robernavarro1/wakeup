import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookingForm } from "./BookingForm"

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login?callbackUrl=" + encodeURIComponent(`/professionals/${(await params).id}/book`))

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      professionalProfile: {
        include: {
          services: true,
          availabilities: true,
        },
      },
    },
  })

  if (!user?.professionalProfile?.published) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
            {user.name?.[0] || "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user.name}
            </h1>
            {user.professionalProfile.title && (
              <p className="text-sm text-gray-500">
                {user.professionalProfile.title}
              </p>
            )}
          </div>
        </div>

        <BookingForm
          professionalId={id}
          profile={user.professionalProfile}
        />
      </div>
    </div>
  )
}
