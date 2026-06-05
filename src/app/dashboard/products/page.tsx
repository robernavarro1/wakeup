import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductsClient from "./ProductsClient"

export default async function DashboardProductsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  })

  return <ProductsClient initialProducts={profile?.products ?? []} />
}
