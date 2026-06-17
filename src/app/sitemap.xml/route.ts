import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://wakeup-app.com"

export async function GET() {
  const staticPages = [
    "", "/explore", "/professionals", "/products", "/advertise",
    "/privacy", "/cookies", "/terms", "/data",
  ]

  const professionals = await prisma.user.findMany({
    where: { role: "PROFESSIONAL", professionalProfile: { published: true } },
    select: { id: true, updatedAt: true },
  })

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
${professionals.map((p) => `  <url>
    <loc>${SITE_URL}/professionals/${p.id}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join("\n")}
${products.map((p) => `  <url>
    <loc>${SITE_URL}/products/${p.id}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n")}
</urlset>`

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
