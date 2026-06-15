"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CategoryMatch {
  id: string
  name: string
  icon: string
  score: number
  reason: string
}

const SUGGESTIONS = [
  "yoga para principiantes", "reiki a distancia", "meditar para la ansiedad",
  "constelaciones familiares", "tarot del amor", "retiro de silencio",
  "masaje terapéutico", "flores de bach", "astrología 2026",
  "registros akáshicos", "sanación con cuencos", "cabalá para todos",
]

const QUICK_ACTIONS = [
  { label: "🧘 Yoga", category: "yoga" },
  { label: "✨ Reiki", category: "reiki" },
  { label: "🪷 Meditación", category: "meditacion" },
  { label: "🔮 Tarot", category: "tarot" },
  { label: "🌿 Constelaciones", category: "constelaciones" },
  { label: "🔥 Retiros", category: "retiros" },
  { label: "📜 Tradiciones", category: "tradiciones" },
  { label: "⭐ Astrología", category: "astrologia" },
]

const SUPPORT_KEYWORDS = ["error", "problema", "no funciona", "bug", "fallo", "ayuda", "soporte", "pago", "cobrar", "stripe", "reserva", "cancelar", "registrarme", "contraseña", "perfil", "email", "verificar"]

const SUPPORT_RESPONSES: { keyword: string; response: string }[] = [
  { keyword: "pago", response: "💳 **Pagos**\nPara pagar una reserva: selecciona servicio y fecha, confirma y serás redirigido a Stripe (pago seguro con tarjeta). El profesional recibe el 85%, Wakeup se queda el 15% de comisión.\n\nSi tienes problemas con un pago, revisa que tu tarjeta tenga fondos suficientes o contacta con tu banco." },
  { keyword: "cobrar", response: "💰 **Cobrar como profesional**\n1. Ve a Dashboard → Perfil\n2. Haz clic en 'Conectar con Stripe'\n3. Sigue los pasos para vincular tu cuenta bancaria\n4. Una vez conectado, los pagos de tus reservas te llegarán directamente (recibes el 85%, Wakeup retiene el 15% de comisión)" },
  { keyword: "stripe", response: "🔒 **Stripe (pagos)**\nStripe es nuestro procesador de pagos, usado por miles de empresas como Amazon y Google. Es 100% seguro.\n\n**Como cliente:** pagas con tarjeta de crédito/débito\n**Como profesional:** conecta tu cuenta en Dashboard → Perfil → Conectar con Stripe para recibir pagos" },
  { keyword: "reserva", response: "📅 **Reservar una sesión**\n1. Explora profesionales en /explore\n2. Elige un perfil que te guste\n3. Selecciona servicio, fecha y hora disponible\n4. Confirma y paga con tarjeta (Stripe)\n5. Recibirás un email con los detalles y el enlace de la videollamada\n6. También puedes ver tus reservas en Dashboard" },
  { keyword: "cancelar", response: "❌ **Cancelar o modificar**\nActualmente las cancelaciones se gestionan de forma individual contactando con el profesional desde tu Dashboard.\n\nPróximamente añadiremos cancelación automática con reembolso integrado." },
  { keyword: "registrarme", response: "📝 **Crear cuenta**\n1. Ve a /auth/register\n2. Elige 'Empieza a explorar' (como alumno) o 'Profesional'\n3. Completa tu nombre, email y contraseña\n4. Te enviaremos un email de verificación — confirma tu email para activar la cuenta" },
  { keyword: "contraseña", response: "🔑 **Recuperar contraseña**\n1. Ve a /auth/forgot-password\n2. Introduce tu email\n3. Te enviaremos un enlace para restablecerla (válido por 1 hora)\n4. Haz clic en el enlace y elige una contraseña nueva" },
  { keyword: "perfil", response: "👤 **Editar perfil profesional**\nDashboard → Mi Perfil\n\nAhí puedes:\n- Añadir servicios con precio y duración\n- Configurar horarios disponibles\n- Escribir tu bio y añadir foto\n- Conectar Stripe para cobrar\n- Publicar tu perfil para que te encuentren" },
  { keyword: "verificar", response: "📧 **Verificar email**\nAl registrarte te enviamos un email con un enlace de verificación. Revisa tu bandeja de entrada y spam.\n\nSi no lo recibes, prueba a:\n1. Revisar la carpeta de spam\n2. Esperar unos minutos\n3 Si sigues sin recibirlo, contacta con soporte en robnavmer@gmail.com" },
  { keyword: "error", response: "⚠️ **Solución de errores**\nPrueba estos pasos:\n1. Recarga la página (F5)\n2. Cierra sesión y vuelve a entrar\n3. Limpia la caché del navegador\n4. Prueba con otro navegador\n\nSi el error persiste, contacta con soporte en robnavmer@gmail.com" },
]

const KEYWORD_MAP: { keyword: string; categoryId: string; reason: string }[] = [
  { keyword: "yoga", categoryId: "yoga", reason: "buscas prácticas de yoga" },
  { keyword: "kundalini", categoryId: "yoga", reason: "te interesa el yoga kundalini" },
  { keyword: "postura", categoryId: "yoga", reason: "buscas mejorar tu práctica física y espiritual" },
  { keyword: "estiramiento", categoryId: "yoga", reason: "el yoga es perfecto para ti" },
  { keyword: "flexibilidad", categoryId: "yoga", reason: "mejorar tu flexibilidad" },
  { keyword: "vinyasa", categoryId: "yoga", reason: "el yoga vinyasa fluido" },
  { keyword: "hatha", categoryId: "yoga", reason: "el yoga hatha tradicional" },
  { keyword: "ashtanga", categoryId: "yoga", reason: "el yoga ashtanga dinámico" },
  { keyword: "clase", categoryId: "yoga", reason: "las clases de yoga" },
  { keyword: "reiki", categoryId: "reiki", reason: "el Reiki te puede ayudar" },
  { keyword: "energía", categoryId: "reiki", reason: "la sanación energética es tu camino" },
  { keyword: "energia", categoryId: "reiki", reason: "la sanación energética" },
  { keyword: "sanación", categoryId: "reiki", reason: "buscas sanación energética" },
  { keyword: "sanacion", categoryId: "reiki", reason: "buscas sanación energética" },
  { keyword: "sanar", categoryId: "reiki", reason: "la sanación energética" },
  { keyword: "chakra", categoryId: "reiki", reason: "equilibrar tus chakras" },
  { keyword: "aura", categoryId: "reiki", reason: "la limpieza de tu aura" },
  { keyword: "tai chi", categoryId: "tai-chi", reason: "el Tai Chi" },
  { keyword: "taichi", categoryId: "tai-chi", reason: "el Tai Chi" },
  { keyword: "tai chi chuan", categoryId: "tai-chi", reason: "el Tai Chi Chuan" },
  { keyword: "bio-danza", categoryId: "bio-danza", reason: "la bio-danza y el movimiento integrativo" },
  { keyword: "biodanza", categoryId: "bio-danza", reason: "la bio-danza" },
  { keyword: "chi kung", categoryId: "chi-kung", reason: "el Chi Kung" },
  { keyword: "chikung", categoryId: "chi-kung", reason: "el Chi Kung" },
  { keyword: "qigong", categoryId: "chi-kung", reason: "el Qigong" },
  { keyword: "ecstatic dance", categoryId: "ecstatic-dance", reason: "la danza libre ecstatic" },
  { keyword: "ecstatic", categoryId: "ecstatic-dance", reason: "la danza ecstatic" },
  { keyword: "danza libre", categoryId: "ecstatic-dance", reason: "la danza libre" },
  { keyword: "barras de access", categoryId: "barras-access", reason: "las Barras de Access" },
  { keyword: "barras access", categoryId: "barras-access", reason: "las Barras de Access" },
  { keyword: "access consciousness", categoryId: "barras-access", reason: "Access Consciousness" },
  { keyword: "flor", categoryId: "medicina", reason: "las flores de Bach" },
  { keyword: "bach", categoryId: "medicina", reason: "las flores de Bach" },
  { keyword: "flores de bach", categoryId: "medicina", reason: "las flores de Bach" },
  { keyword: "acupuntura", categoryId: "medicina", reason: "la acupuntura" },
  { keyword: "osteopatía", categoryId: "medicina", reason: "la osteopatía" },
  { keyword: "osteopatia", categoryId: "medicina", reason: "la osteopatía" },
  { keyword: "ayurveda", categoryId: "medicina", reason: "la medicina ayurvédica" },
  { keyword: "homeopatía", categoryId: "medicina", reason: "la homeopatía" },
  { keyword: "homeopatia", categoryId: "medicina", reason: "la homeopatía" },
  { keyword: "naturopatía", categoryId: "medicina", reason: "la naturopatía" },
  { keyword: "naturopatia", categoryId: "medicina", reason: "la naturopatía" },
  { keyword: "herbolaria", categoryId: "medicina", reason: "la herbolaria medicinal" },
  { keyword: "reflexología", categoryId: "medicina", reason: "la reflexología podal" },
  { keyword: "reflexologia", categoryId: "medicina", reason: "la reflexología podal" },
  { keyword: "meditación", categoryId: "meditacion", reason: "quieres meditar" },
  { keyword: "meditacion", categoryId: "meditacion", reason: "quieres meditar" },
  { keyword: "mindfulness", categoryId: "meditacion", reason: "el mindfulness es para ti" },
  { keyword: "atención", categoryId: "meditacion", reason: "la atención plena" },
  { keyword: "atencion", categoryId: "meditacion", reason: "la atención plena" },
  { keyword: "vipassana", categoryId: "meditacion", reason: "la meditación Vipassana" },
  { keyword: "estrés", categoryId: "meditacion", reason: "reducir tu estrés con meditación" },
  { keyword: "estres", categoryId: "meditacion", reason: "reducir tu estrés con meditación" },
  { keyword: "ansiedad", categoryId: "meditacion", reason: "la meditación para la ansiedad" },
  { keyword: "calma", categoryId: "meditacion", reason: "encontrar calma interior" },
  { keyword: "relajación", categoryId: "meditacion", reason: "la relajación profunda" },
  { keyword: "relajacion", categoryId: "meditacion", reason: "la relajación profunda" },
  { keyword: "cuencos", categoryId: "sonido", reason: "la sanación con cuencos" },
  { keyword: "sonido", categoryId: "sonido", reason: "la terapia de sonido" },
  { keyword: "gong", categoryId: "sonido", reason: "la terapia de gong" },
  { keyword: "vibración", categoryId: "sonido", reason: "la sanación vibracional" },
  { keyword: "vibracion", categoryId: "sonido", reason: "la sanación vibracional" },
  { keyword: "baño de sonido", categoryId: "sonido", reason: "los baños de sonido" },
  { keyword: "baño sonoro", categoryId: "sonido", reason: "los baños de sonido" },
  { keyword: "mantra", categoryId: "sonido", reason: "los mantras y el canto armónico" },
  { keyword: "frecuencia", categoryId: "sonido", reason: "las frecuencias de sanación" },
  { keyword: "432", categoryId: "sonido", reason: "la frecuencia 432Hz" },
  { keyword: "528", categoryId: "sonido", reason: "la frecuencia 528Hz" },
  { keyword: "diapasón", categoryId: "sonido", reason: "los diapasones de sanación" },
  { keyword: "diapason", categoryId: "sonido", reason: "los diapasones de sanación" },
  { keyword: "respiración", categoryId: "respiracion", reason: "la respiración consciente" },
  { keyword: "respiracion", categoryId: "respiracion", reason: "la respiración consciente" },
  { keyword: "holotrópica", categoryId: "respiracion", reason: "la respiración holotrópica" },
  { keyword: "holotropica", categoryId: "respiracion", reason: "la respiración holotrópica" },
  { keyword: "breathwork", categoryId: "respiracion", reason: "el breathwork" },
  { keyword: "pranayama", categoryId: "respiracion", reason: "el pranayama" },
  { keyword: "rebirthing", categoryId: "respiracion", reason: "el rebirthing" },
  { keyword: "animales", categoryId: "animales", reason: "la conexión con los animales" },
  { keyword: "mascota", categoryId: "animales", reason: "conexión con tu mascota" },
  { keyword: "comunicación animal", categoryId: "animales", reason: "comunicación con animales" },
  { keyword: "comunicacion animal", categoryId: "animales", reason: "comunicación con animales" },
  { keyword: "animal de poder", categoryId: "animales", reason: "tu animal de poder" },
  { keyword: "totem", categoryId: "animales", reason: "tu animal tótem" },
  { keyword: "constelación", categoryId: "constelaciones", reason: "las constelaciones familiares" },
  { keyword: "constelacion", categoryId: "constelaciones", reason: "las constelaciones familiares" },
  { keyword: "familia", categoryId: "constelaciones", reason: "sanar tu sistema familiar" },
  { keyword: "terapia sistémica", categoryId: "constelaciones", reason: "la terapia sistémica" },
  { keyword: "terapia sistemica", categoryId: "constelaciones", reason: "la terapia sistémica" },
  { keyword: "transgeneracional", categoryId: "constelaciones", reason: "la terapia transgeneracional" },
  { keyword: "constelación familiar", categoryId: "constelaciones", reason: "las constelaciones familiares" },
  { keyword: "constelacion familiar", categoryId: "constelaciones", reason: "las constelaciones familiares" },
  { keyword: "hipnosis", categoryId: "hipnosis", reason: "la hipnosis terapéutica" },
  { keyword: "hipnoterapia", categoryId: "hipnosis", reason: "la hipnoterapia" },
  { keyword: "regresiva", categoryId: "hipnosis", reason: "la hipnosis regresiva" },
  { keyword: "vidas pasadas", categoryId: "hipnosis", reason: "explorar vidas pasadas" },
  { keyword: "regresión", categoryId: "hipnosis", reason: "la regresión a vidas pasadas" },
  { keyword: "regresion", categoryId: "hipnosis", reason: "la regresión a vidas pasadas" },
  { keyword: "crecimiento", categoryId: "crecimiento", reason: "tu desarrollo personal" },
  { keyword: "desarrollo", categoryId: "crecimiento", reason: "tu desarrollo personal" },
  { keyword: "espiritual", categoryId: "crecimiento", reason: "tu despertar espiritual" },
  { keyword: "conciencia", categoryId: "crecimiento", reason: "expandir tu conciencia" },
  { keyword: "transformación", categoryId: "crecimiento", reason: "tu transformación personal" },
  { keyword: "transformacion", categoryId: "crecimiento", reason: "tu transformación personal" },
  { keyword: "taller", categoryId: "crecimiento", reason: "los talleres de crecimiento" },
  { keyword: "coaching", categoryId: "crecimiento", reason: "el coaching espiritual" },
  { keyword: "potencial", categoryId: "crecimiento", reason: "desarrollar tu potencial" },
  { keyword: "chamanismo", categoryId: "limpieza-energetica", reason: "el chamanismo" },
  { keyword: "chamán", categoryId: "limpieza-energetica", reason: "la sanación chamánica" },
  { keyword: "chaman", categoryId: "limpieza-energetica", reason: "la sanación chamánica" },
  { keyword: "limpieza energética", categoryId: "limpieza-energetica", reason: "limpieza de energías densas" },
  { keyword: "limpieza energetica", categoryId: "limpieza-energetica", reason: "limpieza de energías densas" },
  { keyword: "ritual", categoryId: "limpieza-energetica", reason: "los rituales de sanación" },
  { keyword: "torá", categoryId: "tradiciones", reason: "el estudio de la Torá" },
  { keyword: "tora", categoryId: "tradiciones", reason: "el estudio de la Torá" },
  { keyword: "biblia", categoryId: "tradiciones", reason: "el estudio de la Biblia" },
  { keyword: "bíblico", categoryId: "tradiciones", reason: "los textos bíblicos" },
  { keyword: "biblico", categoryId: "tradiciones", reason: "los textos bíblicos" },
  { keyword: "evangelio", categoryId: "tradiciones", reason: "el estudio de los Evangelios" },
  { keyword: "rabino", categoryId: "tradiciones", reason: "la tradición rabínica" },
  { keyword: "talmud", categoryId: "tradiciones", reason: "el estudio del Talmud" },
  { keyword: "teología", categoryId: "tradiciones", reason: "la teología" },
  { keyword: "teologia", categoryId: "tradiciones", reason: "la teología" },
  { keyword: "pentateuco", categoryId: "tradiciones", reason: "el Pentateuco" },
  { keyword: "exégesis", categoryId: "tradiciones", reason: "la exégesis de las sagradas escrituras" },
  { keyword: "exegesis", categoryId: "tradiciones", reason: "la exégesis" },
  { keyword: "sumerio", categoryId: "tradiciones", reason: "los textos sumerios" },
  { keyword: "egipcio", categoryId: "tradiciones", reason: "los textos egipcios" },
  { keyword: "apócrifo", categoryId: "tradiciones", reason: "los evangelios apócrifos" },
  { keyword: "apocrifo", categoryId: "tradiciones", reason: "los evangelios apócrifos" },
  { keyword: "gnóstico", categoryId: "tradiciones", reason: "los textos gnósticos" },
  { keyword: "gnostico", categoryId: "tradiciones", reason: "los textos gnósticos" },
  { keyword: "nag hammadi", categoryId: "tradiciones", reason: "la Biblioteca de Nag Hammadi" },
  { keyword: "prohibido", categoryId: "tradiciones", reason: "los textos prohibidos" },
  { keyword: "gilgamesh", categoryId: "tradiciones", reason: "la Epopeya de Gilgamesh" },
  { keyword: "anunnaki", categoryId: "tradiciones", reason: "los Anunnaki" },
  { keyword: "kemet", categoryId: "tradiciones", reason: "la sabiduría del Antiguo Egipto" },
  { keyword: "hermético", categoryId: "tradiciones", reason: "la tradición hermética" },
  { keyword: "hermetico", categoryId: "tradiciones", reason: "la tradición hermética" },
  { keyword: "corpus hermeticum", categoryId: "tradiciones", reason: "el Corpus Hermeticum" },
  { keyword: "alquimia", categoryId: "tradiciones", reason: "la alquimia espiritual" },
  { keyword: "cábala", categoryId: "cabala", reason: "el estudio de la Cábala" },
  { keyword: "cabala", categoryId: "cabala", reason: "el estudio de la Cábala" },
  { keyword: "árbol de la vida", categoryId: "cabala", reason: "el Árbol de la Vida" },
  { keyword: "sefirot", categoryId: "cabala", reason: "las 10 sefirot" },
  { keyword: "zohar", categoryId: "cabala", reason: "el Zohar" },
  { keyword: "gematría", categoryId: "cabala", reason: "la gematría" },
  { keyword: "gematria", categoryId: "cabala", reason: "la gematría" },
  { keyword: "numerología", categoryId: "numerologia", reason: "la numerología" },
  { keyword: "numerologia", categoryId: "numerologia", reason: "la numerología" },
  { keyword: "pitagórico", categoryId: "numerologia", reason: "la numerología pitagórica" },
  { keyword: "pitagorico", categoryId: "numerologia", reason: "la numerología pitagórica" },
  { keyword: "número de vida", categoryId: "numerologia", reason: "tu número de vida" },
  { keyword: "numero de vida", categoryId: "numerologia", reason: "tu número de vida" },
  { keyword: "tarot", categoryId: "tarot", reason: "la lectura del tarot" },
  { keyword: "runas", categoryId: "tarot", reason: "las runas nórdicas" },
  { keyword: "adivinación", categoryId: "tarot", reason: "la adivinación" },
  { keyword: "adivinacion", categoryId: "tarot", reason: "la adivinación" },
  { keyword: "oráculo", categoryId: "tarot", reason: "los oráculos" },
  { keyword: "oraculo", categoryId: "tarot", reason: "los oráculos" },
  { keyword: "cartas", categoryId: "tarot", reason: "la lectura de cartas" },
  { keyword: "quiromancia", categoryId: "tarot", reason: "la lectura de manos" },
  { keyword: "péndulo", categoryId: "tarot", reason: "la radiestesia con péndulo" },
  { keyword: "pendulo", categoryId: "tarot", reason: "la radiestesia con péndulo" },
  { keyword: "i ching", categoryId: "tarot", reason: "el I Ching" },
  { keyword: "medium", categoryId: "mediums", reason: "la mediumnidad" },
  { keyword: "mediumnidad", categoryId: "mediums", reason: "la mediumnidad" },
  { keyword: "médium", categoryId: "mediums", reason: "la conexión con los médiums" },
  { keyword: "canalización", categoryId: "mediums", reason: "la canalización espiritual" },
  { keyword: "canalizacion", categoryId: "mediums", reason: "la canalización espiritual" },
  { keyword: "espiritismo", categoryId: "mediums", reason: "el espiritismo" },
  { keyword: "astrología", categoryId: "astrologia", reason: "la astrología" },
  { keyword: "astrologia", categoryId: "astrologia", reason: "la astrología" },
  { keyword: "carta astral", categoryId: "astrologia", reason: "la carta astral" },
  { keyword: "carta natal", categoryId: "astrologia", reason: "la carta natal" },
  { keyword: "horóscopo", categoryId: "astrologia", reason: "el horóscopo" },
  { keyword: "horoscopo", categoryId: "astrologia", reason: "el horóscopo" },
  { keyword: "sinastría", categoryId: "astrologia", reason: "la sinastría de pareja" },
  { keyword: "oculto", categoryId: "ocultismo", reason: "el ocultismo" },
  { keyword: "ocultismo", categoryId: "ocultismo", reason: "el ocultismo" },
  { keyword: "satanismo", categoryId: "ocultismo", reason: "el satanismo" },
  { keyword: "demonio", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "demonología", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "demonologia", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "brujería", categoryId: "ocultismo", reason: "la brujería" },
  { keyword: "brujeria", categoryId: "ocultismo", reason: "la brujería" },
  { keyword: "wicca", categoryId: "ocultismo", reason: "la Wicca" },
  { keyword: "grimorio", categoryId: "ocultismo", reason: "los grimorios" },
  { keyword: "lucifer", categoryId: "ocultismo", reason: "la figura de Lucifer" },
  { keyword: "retiro", categoryId: "retiros", reason: "los retiros espirituales" },
  { keyword: "naturaleza", categoryId: "retiros", reason: "conectar con la naturaleza" },
  { keyword: "escapar", categoryId: "retiros", reason: "escapar de la rutina" },
  { keyword: "viaje iniciático", categoryId: "viajes", reason: "los viajes iniciáticos" },
  { keyword: "viaje iniciatico", categoryId: "viajes", reason: "los viajes iniciáticos" },
  { keyword: "peregrinación", categoryId: "viajes", reason: "las peregrinaciones" },
  { keyword: "peregrinacion", categoryId: "viajes", reason: "las peregrinaciones" },
  { keyword: "machu picchu", categoryId: "viajes", reason: "viaje a Machu Picchu" },
  { keyword: "tíbet", categoryId: "viajes", reason: "viajes al Tíbet" },
  { keyword: "tibet", categoryId: "viajes", reason: "viajes al Tíbet" },
  { keyword: "sedona", categoryId: "viajes", reason: "viajes a Sedona" },
  { keyword: "santiago", categoryId: "viajes", reason: "el Camino de Santiago" },
  { keyword: "camino de santiago", categoryId: "viajes", reason: "el Camino de Santiago" },
  { keyword: "ceremonia", categoryId: "ceremonias", reason: "las ceremonias espirituales" },
  { keyword: "luna llena", categoryId: "ceremonias", reason: "ceremonias de luna llena" },
  { keyword: "temazcal", categoryId: "ceremonias", reason: "el temazcal" },
  { keyword: "cacao", categoryId: "ceremonias", reason: "ceremonias de cacao" },
  { keyword: "plantas de poder", categoryId: "ceremonias", reason: "ceremonias con plantas de poder" },
  { keyword: "feria", categoryId: "ferias-eventos", reason: "las ferias holísticas" },
  { keyword: "mercado", categoryId: "ferias-eventos", reason: "los mercados esotéricos" },
  { keyword: "evento puntual", categoryId: "ferias-eventos", reason: "eventos espirituales" },
  { keyword: "feria holística", categoryId: "ferias-eventos", reason: "la feria holística" },
  { keyword: "feria esotérica", categoryId: "ferias-eventos", reason: "la feria esotérica" },
  { keyword: "zona", categoryId: "zona", reason: "lo que hay en tu zona" },
  { keyword: "cerca", categoryId: "zona", reason: "eventos cerca de ti" },
  { keyword: "local", categoryId: "zona", reason: "profesionales locales" },
  { keyword: "presencial", categoryId: "zona", reason: "sesiones presenciales" },
  { keyword: "encuentro", categoryId: "zona", reason: "encuentros espirituales" },
  { keyword: "charla", categoryId: "zona", reason: "charlas espirituales" },
  { keyword: "podcast", categoryId: "podcasts", reason: "los podcasts espirituales" },
  { keyword: "audio", categoryId: "podcasts", reason: "contenido en audio" },
  { keyword: "escuchar", categoryId: "podcasts", reason: "escuchar contenido espiritual" },
  { keyword: "cristal", categoryId: "materiales", reason: "los cristales" },
  { keyword: "piedra", categoryId: "materiales", reason: "piedras y minerales" },
  { keyword: "mineral", categoryId: "materiales", reason: "minerales" },
  { keyword: "cuenco", categoryId: "materiales", reason: "cuencos tibetanos" },
  { keyword: "incienso", categoryId: "materiales", reason: "inciensos naturales" },
  { keyword: "vela", categoryId: "materiales", reason: "velas rituales" },
  { keyword: "mandala", categoryId: "materiales", reason: "mandalas y arte sagrado" },
  { keyword: "libro", categoryId: "materiales", reason: "libros espirituales" },
  { keyword: "aceite", categoryId: "materiales", reason: "aceites esenciales" },
  { keyword: "artesanía", categoryId: "materiales", reason: "artesanía espiritual" },
  { keyword: "artesania", categoryId: "materiales", reason: "artesanía espiritual" },
  { keyword: "altar", categoryId: "materiales", reason: "elementos para tu altar" },
  { keyword: "pulsera", categoryId: "materiales", reason: "pulseras energéticas" },
  { keyword: "amuleto", categoryId: "materiales", reason: "amuletos de protección" },
  { keyword: "cojín", categoryId: "materiales", reason: "cojines de yoga" },
  { keyword: "esterilla", categoryId: "materiales", reason: "esterillas de yoga" },
  { keyword: "ayuno", categoryId: "nutricion", reason: "el ayuno espiritual" },
  { keyword: "vegano", categoryId: "nutricion", reason: "el veganismo" },
  { keyword: "veganismo", categoryId: "nutricion", reason: "el veganismo" },
  { keyword: "nutrición", categoryId: "nutricion", reason: "la nutrición consciente" },
  { keyword: "nutricion", categoryId: "nutricion", reason: "la nutrición consciente" },
  { keyword: "alimentación", categoryId: "nutricion", reason: "la alimentación consciente" },
  { keyword: "alimentacion", categoryId: "nutricion", reason: "la alimentación consciente" },
  { keyword: "detox", categoryId: "nutricion", reason: "el detox" },
  { keyword: "superalimento", categoryId: "nutricion", reason: "los superalimentos" },
  { keyword: "macrobiótica", categoryId: "nutricion", reason: "la macrobiótica" },
  { keyword: "macrobiotica", categoryId: "nutricion", reason: "la macrobiótica" },
  { keyword: "crudivegano", categoryId: "nutricion", reason: "el crudiveganismo" },
]

const CATEGORY_INFO: Record<string, { name: string; icon: string }> = {
  zona: { name: "En tu Zona", icon: "📍" },
  podcasts: { name: "Top Podcasts Espirituales", icon: "🎙️" },
  yoga: { name: "Yoga", icon: "🧘" },
  reiki: { name: "Reiki", icon: "✨" },
  "tai-chi": { name: "Tai Chi", icon: "☯️" },
  "bio-danza": { name: "Bio-danza", icon: "💃" },
  "chi-kung": { name: "Chi Kung", icon: "🌊" },
  "ecstatic-dance": { name: "Ecstatic Dance", icon: "🔄" },
  "barras-access": { name: "Barras de Access", icon: "🧠" },
  nutricion: { name: "Nutrición Consciente", icon: "🥗" },
  medicina: { name: "Medicina Alternativa", icon: "🏥" },
  meditacion: { name: "Meditación & Mindfulness", icon: "🪷" },
  sonido: { name: "Terapias de Sonido", icon: "🎵" },
  respiracion: { name: "Respiración Consciente", icon: "🌬️" },
  animales: { name: "Terapia con Animales", icon: "🐾" },
  constelaciones: { name: "Constelaciones Familiares", icon: "🌿" },
  hipnosis: { name: "Hipnosis Clínica y Regresiva", icon: "🌀" },
  crecimiento: { name: "Crecimiento Personal", icon: "🌱" },
  "limpieza-energetica": { name: "Limpieza Energética y Chamanismo", icon: "🔥" },
  tradiciones: { name: "Tradiciones Sagradas y Sabiduría Ancestral", icon: "📜" },
  cabala: { name: "Cábala", icon: "✡️" },
  numerologia: { name: "Numerología", icon: "🔢" },
  tarot: { name: "Tarot, Runas y Métodos Adivinatorios", icon: "🃏" },
  mediums: { name: "Mediums", icon: "👁️" },
  astrologia: { name: "Astrología", icon: "⭐" },
  ocultismo: { name: "Ocultismo", icon: "🔮" },
  viajes: { name: "Viajes Iniciáticos y Peregrinaciones", icon: "✈️" },
  retiros: { name: "Retiros Espirituales", icon: "🔥" },
  ceremonias: { name: "Ceremonias", icon: "🌙" },
  "ferias-eventos": { name: "Ferias y Eventos Puntuales", icon: "🎪" },
  materiales: { name: "Materiales para tu Despertar", icon: "💎" },
}

export function AIAdvisor() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string; matches?: CategoryMatch[]; isSupport?: boolean }[]
  >([
    {
      role: "ai",
      text: "¡Hola! Soy tu guía en Wakeup. Puedo ayudarte de dos formas:\n\n🔮 **Recomendarte** categorías según tus intereses (yoga, tarot, meditación, ocultismo...)\n💬 **Resolver dudas** sobre pagos, reservas, registro, contraseñas, etc.\n\n¿Qué necesitas? Cuéntame qué buscas o qué problema tienes.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function isSupportQuery(text: string): boolean {
    const lower = text.toLowerCase()
    return SUPPORT_KEYWORDS.some((kw) => lower.includes(kw))
  }

  function getSupportResponse(text: string): string | null {
    const lower = text.toLowerCase()
    const matched = SUPPORT_RESPONSES.find((r) => lower.includes(r.keyword))
    return matched?.response || null
  }

  function analyzeText(text: string): CategoryMatch[] {
    const lower = text.toLowerCase()
    const words = lower.split(/\s+/)
    const scores: Record<string, { score: number; reasons: Set<string> }> = {}

    for (const word of words) {
      for (const mapping of KEYWORD_MAP) {
        if (mapping.keyword.includes(" ")) {
          if (lower.includes(mapping.keyword)) {
            if (!scores[mapping.categoryId]) {
              scores[mapping.categoryId] = { score: 0, reasons: new Set() }
            }
            scores[mapping.categoryId].score += 3
            scores[mapping.categoryId].reasons.add(mapping.reason)
          }
        } else if (word === mapping.keyword) {
          if (!scores[mapping.categoryId]) {
            scores[mapping.categoryId] = { score: 0, reasons: new Set() }
          }
          scores[mapping.categoryId].score += 2
          scores[mapping.categoryId].reasons.add(mapping.reason)
        } else if (
          word.length >= 4 &&
          mapping.keyword.length >= 4 &&
          (word.includes(mapping.keyword) || mapping.keyword.includes(word))
        ) {
          if (!scores[mapping.categoryId]) {
            scores[mapping.categoryId] = { score: 0, reasons: new Set() }
          }
          scores[mapping.categoryId].score += 1
          scores[mapping.categoryId].reasons.add(mapping.reason)
        }
      }
    }

    const results: CategoryMatch[] = Object.entries(scores)
      .map(([id, data]) => ({
        id,
        name: CATEGORY_INFO[id]?.name || id,
        icon: CATEGORY_INFO[id]?.icon || "🔮",
        score: data.score,
        reason: Array.from(data.reasons).slice(0, 2).join(" y "),
      }))
      .sort((a, b) => b.score - a.score)

    return results
  }

  function handleSend() {
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userText }])
    setLoading(true)

    setTimeout(() => {
      const isSupport = isSupportQuery(userText)

      if (isSupport) {
        const supportResponse = getSupportResponse(userText)
        if (supportResponse) {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: supportResponse + "\n\n¿Necesitas ayuda con algo más?",
              isSupport: true,
            },
          ])
          setLoading(false)
          return
        }
      }

      const matches = analyzeText(userText)

      if (matches.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "No tengo una recomendación clara. Puedo ayudarte de dos formas:\n\n🔮 **Recomendarte** por tus intereses — dime qué te gusta (yoga, tarot, meditación, ocultismo, etc.)\n💬 **Resolver dudas** — pregúntame sobre pagos, reservas, registro, contraseñas...\n\n¿Qué prefieres?",
          },
        ])
      } else {
        const topMatches = matches.slice(0, 5)
        const recommendations = topMatches
          .map(
            (m, i) =>
              `${i + 1}. ${m.icon} **${m.name}** — ${m.reason}`
          )
          .join("\n")

        const otherCount = matches.length - 5
        const otherText = otherCount > 0 ? `\n\nTambién detecté ${otherCount} categoría${otherCount > 1 ? "s" : ""} más relacionada${otherCount > 1 ? "s" : ""} (puedes preguntarme de nuevo si quieres explorar otras).` : ""

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Según lo que me cuentas, esto es lo que más te puede interesar:\n\n${recommendations}${otherText}\n\n¿Quieres que te lleve a alguna categoría?`,
            matches: topMatches,
          },
        ])
      }
      setLoading(false)
    }, 1000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-amber-600 text-2xl text-white shadow-xl shadow-purple-600/30 transition hover:scale-105 hover:shadow-purple-600/50"
        title="¿Necesitas ayuda?"
      >
        🤖
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-2xl border border-white/10 bg-[#0f0a1a]/95 shadow-2xl shadow-purple-600/20 backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-amber-600/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-sm font-semibold text-white">Guía Wakeup</p>
            <p className="text-xs text-purple-300/50">
              Recomendaciones y soporte
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-purple-300/50 transition hover:bg-white/5 hover:text-purple-200"
        >
          ✕
        </button>
      </div>

      <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-purple-600/30 text-purple-100"
                  : "bg-white/5 text-purple-200"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

              {msg.matches && msg.matches.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {msg.matches.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        router.push(`/explore?c=${m.id}`)
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-left text-sm text-purple-200 transition hover:bg-purple-500/20"
                    >
                      <span>{m.icon}</span>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-purple-300/50">{m.reason}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-purple-300/50">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: yoga, paganismo, error en pago..."
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-purple-300/30 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 text-sm text-white transition hover:opacity-90 disabled:opacity-30"
          >
            ➤
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.slice(0, 4).map((action) => (
            <button
              key={action.category}
              onClick={() => {
                setInput(action.label)
              }}
              className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-purple-300/50 transition hover:bg-white/10 hover:text-purple-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
