const { Pool } = require("pg")
const crypto = require("crypto")

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_u3ze2ovgwbXZ@ep-old-pine-aqwn476h-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
})

function cuid() {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(12).toString("base64url").slice(0, 16)
  return `c${timestamp}${random}`
}

const PRODUCTS = [
  { name: "Esterilla de Yoga Eco-Friendly", description: "Esterilla antideslizante de 6mm, ideal para yoga, pilates y meditación. Ecológica y libre de tóxicos.", price: 2499, image: "https://m.media-amazon.com/images/I/71znHq7ytIL._AC_SX679_.jpg", category: "yoga", amazonUrl: "https://www.amazon.es/dp/B07RL2N73W" },
  { name: "Cojín de Meditación Zafu Redondo", description: "Cojín redondo de meditación relleno de trigo sarraceno, con funda de algodón orgánico extraíble.", price: 3499, image: "https://m.media-amazon.com/images/I/81QGvH4JWmL._AC_SX679_.jpg", category: "meditacion", amazonUrl: "https://www.amazon.es/dp/B0DFY96HSC" },
  { name: "Cuenco Tibetano Artesanal 7 Metales", description: "Cuenco tibetano hecho a mano con aleación de 7 metales. Incluye mazo y cojín. Sonido puro para meditación.", price: 2599, image: "https://m.media-amazon.com/images/I/81TEpZm7uQL._AC_SX679_.jpg", category: "terapias", amazonUrl: "https://www.amazon.es/dp/B0CLVSWR95" },
  { name: "Baraja Tarot Rider Waite Smith", description: "Mazo clásico de 78 cartas Rider Waite Smith con guía en español.", price: 1899, image: "https://m.media-amazon.com/images/I/81McnwMdpPL._AC_SX679_.jpg", category: "tarot", amazonUrl: "https://www.amazon.es/dp/B0CN2LJ82J" },
  { name: "Aceite Esencial de Lavanda 100% Puro", description: "Aceite esencial de lavanda 100% natural. Ideal para aromaterapia, relajación y meditación.", price: 1299, image: "https://m.media-amazon.com/images/I/71ChCQoVM-L._AC_SX679_.jpg", category: "terapias", amazonUrl: "https://www.amazon.es/dp/B0C3B6F9Y3" },
  { name: "Difusor de Aromas Ultrasónico 300ml", description: "Difusor de aceites esenciales con luz LED. Silencioso, cobertura 30m².", price: 2499, image: "https://m.media-amazon.com/images/I/611U4nRGkkL._AC_SX679_.jpg", category: "meditacion", amazonUrl: "https://www.amazon.es/dp/B07MSJDB8M" },
  { name: "Palo Santo en Rama 10 uds", description: "Pack de 10 varitas de Palo Santo de Ecuador. Ahumado natural para limpieza energética.", price: 999, image: "https://m.media-amazon.com/images/I/81AM7+KMqsL._AC_SX679_.jpg", category: "terapias", amazonUrl: "https://www.amazon.es/dp/B0D9FJMBKV" },
  { name: "Manta de Yoga y Meditación 180x120", description: "Manta suave de algodón 100% natural para meditación, yoga nidra, pilates y relajación.", price: 2599, image: "https://m.media-amazon.com/images/I/51xMtrjLCuL._AC_SX679_.jpg", category: "yoga", amazonUrl: "https://www.amazon.es/dp/B01EXDJ31G" },
  { name: "Incienso de Sándalo Pack 200 Barritas", description: "Barritas de incienso natural de sándalo. 200 unidades.", price: 799, image: "https://m.media-amazon.com/images/I/61lTY3bobIL._AC_SX679_.jpg", category: "terapias", amazonUrl: "https://www.amazon.es/dp/B00GYFUIWU" },
  { name: "Cuarzo Rosa Drusa Natural", description: "Drusa de cuarzo rosa natural de tamaño mediano. Piedra de amor incondicional.", price: 1499, image: "https://m.media-amazon.com/images/I/71i2gww2y2L._AC_SX679_.jpg", category: "terapias", amazonUrl: "https://www.amazon.es/dp/B07XJGBXZQ" },
  { name: "El Poder del Ahora - Eckhart Tolle", description: "El clásico de Eckhart Tolle sobre espiritualidad y mindfulness.", price: 1199, image: "https://m.media-amazon.com/images/I/7173TU77GBL._AC_SX679_.jpg", category: "crecimiento", amazonUrl: "https://www.amazon.es/dp/B006IBR7J2" },
  { name: "Yoga Bolster Cojín Rectangular", description: "Cojín bolster de yoga relleno de algodón, con funda extraíble.", price: 3999, image: "https://m.media-amazon.com/images/I/715HTFpgwYL._AC_SX679_.jpg", category: "yoga", amazonUrl: "https://www.amazon.es/dp/B0GLZRM9L3" },
]

async function main() {
  // Create store user if not exists
  let res = await pool.query("SELECT id FROM \"User\" WHERE email = 'tienda@wakeup-app.com'")
  let userId
  if (res.rows.length === 0) {
    const id = cuid()
    const now = new Date().toISOString()
    await pool.query("INSERT INTO \"User\" (id, email, name, role, \"updatedAt\", \"createdAt\") VALUES ($1, 'tienda@wakeup-app.com', 'Wakeup Tienda', 'PROFESSIONAL', $2, $2)", [id, now])
    userId = id
    console.log("👤 Usuario tienda creado")
  } else {
    userId = res.rows[0].id
    console.log("👤 Usuario tienda existe")
  }

  // Create professional profile if not exists
  res = await pool.query("SELECT id FROM \"ProfessionalProfile\" WHERE \"userId\" = $1", [userId])
  let profileId
  if (res.rows.length === 0) {
    const id = cuid()
    const now = new Date().toISOString()
    await pool.query("INSERT INTO \"ProfessionalProfile\" (id, \"userId\", title, published, \"updatedAt\") VALUES ($1, $2, 'Wakeup Store', true, $3)", [id, userId, now])
    profileId = id
    console.log("✅ Perfil Wakeup Store creado")
  } else {
    profileId = res.rows[0].id
    console.log("✅ Perfil Wakeup Store existe")
  }

  // Delete old Amazon products
  const del = await pool.query("DELETE FROM \"Product\" WHERE \"amazonUrl\" IS NOT NULL")
  console.log(`🗑️ ${del.rowCount} productos antiguos eliminados`)

  // Insert products
  for (const p of PRODUCTS) {
    const now = new Date().toISOString()
    await pool.query(
      "INSERT INTO \"Product\" (id, \"profileId\", name, description, price, image, category, \"amazonUrl\", active, \"commissionPercent\", \"updatedAt\", \"createdAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 15, $9, $9)",
      [cuid(), profileId, p.name, p.description, p.price, p.image, p.category, p.amazonUrl, now]
    )
  }

  console.log(`✅ ${PRODUCTS.length} productos insertados`)
  await pool.end()
}

main().catch((e) => { console.error("❌", e); process.exit(1) })
