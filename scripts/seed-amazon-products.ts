import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { confirmDestructive } from "./lib/safe"

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "", ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const AMAZON_PRODUCTS = [
  {
    name: "Esterilla de Yoga Eco-Friendly",
    description: "Esterilla antideslizante de 6mm, ideal para yoga, pilates y meditación. Ecológica y libre de tóxicos.",
    price: 2499,
    image: "https://m.media-amazon.com/images/I/71znHq7ytIL._AC_SX679_.jpg",
    category: "yoga",
    amazonUrl: "https://www.amazon.es/dp/B07RL2N73W",
  },
  {
    name: "Cojín de Meditación Zafu Redondo",
    description: "Cojín redondo de meditación relleno de trigo sarraceno, con funda de algodón orgánico extraíble.",
    price: 3499,
    image: "https://m.media-amazon.com/images/I/81QGvH4JWmL._AC_SX679_.jpg",
    category: "meditacion",
    amazonUrl: "https://www.amazon.es/dp/B0DFY96HSC",
  },
  {
    name: "Cuenco Tibetano Artesanal 7 Metales",
    description: "Cuenco tibetano hecho a mano con aleación de 7 metales. Incluye mazo y cojín. Sonido puro para meditación.",
    price: 2599,
    image: "https://m.media-amazon.com/images/I/81TEpZm7uQL._AC_SX679_.jpg",
    category: "terapias",
    amazonUrl: "https://www.amazon.es/dp/B0CLVSWR95",
  },
  {
    name: "Baraja Tarot Rider Waite Smith",
    description: "Mazo clásico de 78 cartas Rider Waite Smith con guía en español. Ideal para lecturas de tarot y autoconocimiento.",
    price: 1899,
    image: "https://m.media-amazon.com/images/I/81McnwMdpPL._AC_SX679_.jpg",
    category: "tarot",
    amazonUrl: "https://www.amazon.es/dp/B0CN2LJ82J",
  },
  {
    name: "Aceite Esencial de Lavanda 100% Puro",
    description: "Aceite esencial de lavanda 100% natural. Ideal para aromaterapia, relajación, meditación y baños.",
    price: 1299,
    image: "https://m.media-amazon.com/images/I/71ChCQoVM-L._AC_SX679_.jpg",
    category: "terapias",
    amazonUrl: "https://www.amazon.es/dp/B0C3B6F9Y3",
  },
  {
    name: "Difusor de Aromas Ultrasónico 300ml",
    description: "Difusor de aceites esenciales con luz LED. Silencioso, cobertura 30m². Ideal para habitaciones y meditación.",
    price: 2499,
    image: "https://m.media-amazon.com/images/I/611U4nRGkkL._AC_SX679_.jpg",
    category: "meditacion",
    amazonUrl: "https://www.amazon.es/dp/B07MSJDB8M",
  },
  {
    name: "Palo Santo en Rama 10 uds",
    description: "Pack de 10 varitas de Palo Santo de Ecuador. Ahumado natural para limpieza energética y rituales espirituales.",
    price: 999,
    image: "https://m.media-amazon.com/images/I/81AM7+KMqsL._AC_SX679_.jpg",
    category: "terapias",
    amazonUrl: "https://www.amazon.es/dp/B0D9FJMBKV",
  },
  {
    name: "Manta de Yoga y Meditación 180x120",
    description: "Manta suave de algodón 100% natural para meditación, yoga nidra, pilates y relajación.",
    price: 2599,
    image: "https://m.media-amazon.com/images/I/51xMtrjLCuL._AC_SX679_.jpg",
    category: "yoga",
    amazonUrl: "https://www.amazon.es/dp/B01EXDJ31G",
  },
  {
    name: "Incienso de Sándalo Pack 200 Barritas",
    description: "Barritas de incienso natural de sándalo. 200 unidades para meditación, yoga, rituales y aromaterapia.",
    price: 799,
    image: "https://m.media-amazon.com/images/I/61lTY3bobIL._AC_SX679_.jpg",
    category: "terapias",
    amazonUrl: "https://www.amazon.es/dp/B00GYFUIWU",
  },
  {
    name: "Cuarzo Rosa Drusa Natural",
    description: "Drusa de cuarzo rosa natural de tamaño mediano. Piedra de amor incondicional y sanación emocional.",
    price: 1499,
    image: "https://m.media-amazon.com/images/I/71i2gww2y2L._AC_SX679_.jpg",
    category: "terapias",
    amazonUrl: "https://www.amazon.es/dp/B07XJGBXZQ",
  },
  {
    name: "El Poder del Ahora - Eckhart Tolle",
    description: "El clásico de Eckhart Tolle sobre espiritualidad, mindfulness y despertar de la conciencia. Best-seller mundial.",
    price: 1199,
    image: "https://m.media-amazon.com/images/I/7173TU77GBL._AC_SX679_.jpg",
    category: "crecimiento",
    amazonUrl: "https://www.amazon.es/dp/B006IBR7J2",
  },
  {
    name: "Yoga Bolster Cojín Rectangular",
    description: "Cojín bolster de yoga relleno de algodón, con funda extraíble. Ideal para posturas restaurativas y meditación.",
    price: 3999,
    image: "https://m.media-amazon.com/images/I/715HTFpgwYL._AC_SX679_.jpg",
    category: "yoga",
    amazonUrl: "https://www.amazon.es/dp/B0GLZRM9L3",
  },
]

async function main() {
  const STORE_EMAIL = "tienda@wakeup-app.com"

  let profile = await prisma.professionalProfile.findFirst({
    where: { title: "Wakeup Store" },
  })

  if (!profile) {
    let user = await prisma.user.findUnique({ where: { email: STORE_EMAIL } })
    if (!user) {
      user = await prisma.user.create({
        data: { email: STORE_EMAIL, name: "Wakeup Tienda", role: "PROFESSIONAL" },
      })
      console.log("👤 Usuario de tienda creado:", user.email)
    }
    profile = await prisma.professionalProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, title: "Wakeup Store", published: true },
    })
    console.log("✅ Perfil Wakeup Store creado")
  } else {
    console.log("✅ Perfil Wakeup Store encontrado")
  }

  const confirmed = await confirmDestructive(
    `Delete all Amazon products (${await prisma.product.count({ where: { amazonUrl: { not: null } } })}) and re-insert ${AMAZON_PRODUCTS.length} products`
  )
  if (!confirmed) { console.log("⏭️ Cancelado"); return }

  await prisma.product.deleteMany({ where: { amazonUrl: { not: null } } })
  console.log("🗑️ Productos Amazon antiguos eliminados")

  for (const p of AMAZON_PRODUCTS) {
    await prisma.product.create({
      data: { profileId: profile.id, ...p, active: true, commissionPercent: 15 },
    })
  }

  console.log(`✅ ${AMAZON_PRODUCTS.length} productos insertados correctamente`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error("❌ Error:", e); process.exit(1) })
