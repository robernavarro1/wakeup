import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const AMAZON_TAG = "wakeup04d-21"

const products = [
  { name: "Esterilla de Yoga Profesional Antideslizante", description: "Esterilla de 6mm con textura antideslizante, ideal para yoga, pilates y estiramientos. Material ecológico libre de TPE.", price: 2999, amazonUrl: "https://www.amazon.es/dp/B09V5Q2FBP", category: "Yoga", image: "https://m.media-amazon.com/images/I/71E1+YVjMBL._AC_SL1500_.jpg" },
  { name: "Bloques de Yoga de Corcho (2 unidades)", description: "Bloques de corcho natural antideslizantes, 23x15x7.5cm. Perfectos para alinear y soportar posturas.", price: 1899, amazonUrl: "https://www.amazon.es/dp/B0BXQFHZR6", category: "Yoga", image: "https://m.media-amazon.com/images/I/71Y0+4KdUBL._AC_SL1500_.jpg" },
  { name: "Cinta de Yoga Elástica 5 niveles", description: "Set de 5 bandas elásticas de diferente resistencia para estiramientos y flexibilidad. Incluye bolsa de transporte.", price: 1599, amazonUrl: "https://www.amazon.es/dp/B093QGJX2Q", category: "Yoga", image: "https://m.media-amazon.com/images/I/71bk+UcE3wL._AC_SL1500_.jpg" },
  { name: "Cojín de Meditación Zafu con Repostrapié", description: "Cojín tradicional japonés relleno de cáscara de sarracenia. Ajustable en altura, cubierta lavable.", price: 3499, amazonUrl: "https://www.amazon.es/dp/B08DHLX1QG", category: "Meditación", image: "https://m.media-amazon.com/images/I/71iI7W9Xa1L._AC_SL1500_.jpg" },
  { name: "Cuencos Tibetanos de Canto (tamaño mediano)", description: "Cuenco de metal artesanal con almohadilla y mazo de felpa. Sonido profundo y resonante para meditación.", price: 2499, amazonUrl: "https://www.amazon.es/dp/B07Y5YQC1K", category: "Meditación", image: "https://m.media-amazon.com/images/I/71H5dM6eHKL._AC_SL1500_.jpg" },
  { name: "Manta de Meditación de Algodón Orgánico", description: "Manta suave de algodón orgánico 150x200cm, ideal para practicar meditación y yoga nidra.", price: 2299, amazonUrl: "https://www.amazon.es/dp/B0B9HK8QNY", category: "Meditación", image: "https://m.media-amazon.com/images/I/71qd3K+VZFL._AC_SL1500_.jpg" },
  { name: "Incienso Natural de Sándalo (15 varillas)", description: "Varillas de incienso artesanal de sándalo puro. Aroma dulce y calmante ideal para meditación.", price: 899, amazonUrl: "https://www.amazon.es/dp/B07MBJMR6X", category: "Aromaterapia", image: "https://m.media-amazon.com/images/I/71bm1ZK3d0L._AC_SL1500_.jpg" },
  { name: "Aceite Esencial de Lavanda 100ml", description: "Aceite esencial puro de lavanda francesa para difusor, masajes y relajación.", price: 1299, amazonUrl: "https://www.amazon.es/dp/B076B3YCVF", category: "Aromaterapia", image: "https://m.media-amazon.com/images/I/61VJYgDQD2L._AC_SL1500_.jpg" },
  { name: "Difusor de Aromas con Luz LED", description: "Difusor ultrasónico 300ml con 7 luces LED y temporizador. Silencioso, ideal para sesiones.", price: 2199, amazonUrl: "https://www.amazon.es/dp/B08DHVR9RW", category: "Aromaterapia", image: "https://m.media-amazon.com/images/I/61VqY9+bXVL._AC_SL1500_.jpg" },
  { name: "Baraja Rider-Waite Tarot Clásico", description: "La baraja de tarot más famosa del mundo, 78 cartas con guía en español. Edición oficial.", price: 1699, amazonUrl: "https://www.amazon.es/dp/B07DKP4XYP", category: "Tarot", image: "https://m.media-amazon.com/images/I/81WCN1qDraL._AC_SL1500_.jpg" },
  { name: "Mandala de Cristal con Cuarzo Rosa", description: "Mandala de cuarzo rosa natural para meditación y equilibrio del chakra corazón. Diámetro 15cm.", price: 2799, amazonUrl: "https://www.amazon.es/dp/B09WXZMR6J", category: "Cristales", image: "https://m.media-amazon.com/images/I/71U3l+CKB3L._AC_SL1500_.jpg" },
  { name: "Set de 7 Chakras - Piedras Naturales", description: "Set completo de 7 piedras naturales para equilibrio de chakras con bolsa de terciopelo.", price: 1499, amazonUrl: "https://www.amazon.es/dp/B07MBK7WYM", category: "Cristales", image: "https://m.media-amazon.com/images/I/71B+YgJ7HhL._AC_SL1500_.jpg" },
  { name: "Vela de Aromaterapia para Reiki", description: "Vela de cera de soja con esencia de salvia y palo santo. Ideal para ceremonias y limpieza energética.", price: 1299, amazonUrl: "https://www.amazon.es/dp/B09QHZWXG1", category: "Reiki", image: "https://m.media-amazon.com/images/I/61Mw3WnKMaL._AC_SL1500_.jpg" },
  { name: "Pluma de Águila para Smudging", description: "Pluma natural de águila para ceremonias de smudging y limpieza energética. Incluye base de madera.", price: 1899, amazonUrl: "https://www.amazon.es/dp/B0BNKBXRK6", category: "Reiki", image: "https://m.media-amazon.com/images/I/71dV7Z+F3uL._AC_SL1500_.jpg" },
  { name: "El Poder del Ahora - Eckhart Tolle", description: "Guía espiritual para encontrar la paz interior y vivir en el momento presente. Bestseller mundial.", price: 1099, amazonUrl: "https://www.amazon.es/dp/8449311519", category: "Libros", image: "https://m.media-amazon.com/images/I/81fWwE7M3tL._AC_SL1500_.jpg" },
  { name: "Los 7 Hábitos de la Gente Efectiva", description: "Desarrollo personal y espiritual para transformar tu vida. Stephen Covey.", price: 1299, amazonUrl: "https://www.amazon.es/dp/8467046258", category: "Libros", image: "https://m.media-amazon.com/images/I/81bsw6fUiOL._AC_SL1500_.jpg" },
]

async function main() {
  console.log("Seeding Wakeup Store profile...")

  const storeUser = await prisma.user.upsert({
    where: { email: "store@wakeup-app.com" },
    update: {},
    create: {
      email: "store@wakeup-app.com",
      name: "Wakeup Store",
      password: "$2a$12$LJ3m4ys3Lk0TSwHjnR5hUOKn2kSPxYVxh7x8kSq3z1XlS2nFf3gAi",
      role: "PROFESSIONAL",
      termsAcceptedAt: new Date(),
    },
  })

  let profile = await prisma.professionalProfile.findUnique({ where: { userId: storeUser.id } })
  if (!profile) {
    profile = await prisma.professionalProfile.create({
      data: {
        userId: storeUser.id,
        title: "Tienda Wakeup — Productos para el despertar",
        bio: "Productos recomendados por la comunidad Wakeup para tu práctica de yoga, meditación, reiki y desarrollo espiritual.",
        city: "Online",
        published: true,
      },
    })
  }

  console.log(`Store profile: ${profile.id}`)

  for (const p of products) {
    const affiliateUrl = p.amazonUrl + (p.amazonUrl.includes("?") ? "&" : "?") + `tag=${AMAZON_TAG}`
    const existing = await prisma.product.findFirst({ where: { name: p.name, profileId: profile.id } })
    if (!existing) {
      await prisma.product.create({
        data: {
          profileId: profile.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          amazonUrl: affiliateUrl,
          category: p.category,
          active: true,
        },
      })
      console.log(`  ✓ ${p.name}`)
    } else {
      console.log(`  - ${p.name} (exists)`)
    }
  }

  console.log(`\nDone!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
