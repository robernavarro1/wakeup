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

const KEYWORD_MAP: { keyword: string; categoryId: string; reason: string }[] = [
  { keyword: "yoga", categoryId: "yoga", reason: "buscas prácticas de yoga" },
  { keyword: "kundalini", categoryId: "yoga", reason: "te interesa el yoga kundalini" },
  { keyword: "postura", categoryId: "yoga", reason: "buscas mejorar tu práctica física y espiritual" },
  { keyword: "estiramiento", categoryId: "yoga", reason: "el yoga es perfecto para ti" },
  { keyword: "flexibilidad", categoryId: "yoga", reason: "mejorar tu flexibilidad" },
  { keyword: "reiki", categoryId: "reiki", reason: "el Reiki te puede ayudar" },
  { keyword: "energía", categoryId: "reiki", reason: "la sanación energética es tu camino" },
  { keyword: "sanación", categoryId: "reiki", reason: "buscas sanación energética" },
  { keyword: "chakra", categoryId: "reiki", reason: "equilibrar tus chakras" },
  { keyword: "flor", categoryId: "terapias", reason: "las flores de Bach son ideales para ti" },
  { keyword: "bach", categoryId: "terapias", reason: "las flores de Bach te pueden ayudar" },
  { keyword: "constelación", categoryId: "terapias", reason: "las constelaciones familiares" },
  { keyword: "constelacion", categoryId: "terapias", reason: "las constelaciones familiares" },
  { keyword: "familia", categoryId: "terapias", reason: "sanar tu sistema familiar" },
  { keyword: "cuencos", categoryId: "terapias", reason: "la sanación con sonido" },
  { keyword: "sonido", categoryId: "terapias", reason: "la terapia de sonido" },
  { keyword: "masaje", categoryId: "terapias", reason: "los masajes terapéuticos" },
  { keyword: "meditación", categoryId: "meditacion", reason: "quieres meditar" },
  { keyword: "meditacion", categoryId: "meditacion", reason: "quieres meditar" },
  { keyword: "mindfulness", categoryId: "meditacion", reason: "el mindfulness es para ti" },
  { keyword: "atención", categoryId: "meditacion", reason: "la atención plena" },
  { keyword: "vipassana", categoryId: "meditacion", reason: "la meditación Vipassana" },
  { keyword: "estrés", categoryId: "meditacion", reason: "reducir tu estrés con meditación" },
  { keyword: "estres", categoryId: "meditacion", reason: "reducir tu estrés con meditación" },
  { keyword: "ansiedad", categoryId: "meditacion", reason: "la meditación para la ansiedad" },
  { keyword: "crecimiento", categoryId: "crecimiento", reason: "tu desarrollo personal" },
  { keyword: "desarrollo", categoryId: "crecimiento", reason: "tu desarrollo personal" },
  { keyword: "espiritual", categoryId: "crecimiento", reason: "tu despertar espiritual" },
  { keyword: "conciencia", categoryId: "crecimiento", reason: "expandir tu conciencia" },
  { keyword: "transformación", categoryId: "crecimiento", reason: "tu transformación personal" },
  { keyword: "transformacion", categoryId: "crecimiento", reason: "tu transformación personal" },
  { keyword: "taller", categoryId: "crecimiento", reason: "los talleres de crecimiento" },
  { keyword: "retiro", categoryId: "retiros", reason: "los retiros espirituales" },
  { keyword: "evento", categoryId: "retiros", reason: "eventos espirituales" },
  { keyword: "ceremonia", categoryId: "retiros", reason: "ceremonias espirituales" },
  { keyword: "naturaleza", categoryId: "retiros", reason: "conectar con la naturaleza" },
  { keyword: "escapar", categoryId: "retiros", reason: "escapar de la rutina" },
  { keyword: "tai chi", categoryId: "actividades", reason: "el Tai Chi" },
  { keyword: "taichi", categoryId: "actividades", reason: "el Tai Chi" },
  { keyword: "chi kung", categoryId: "actividades", reason: "el Chi Kung" },
  { keyword: "chikung", categoryId: "actividades", reason: "el Chi Kung" },
  { keyword: "bio-danza", categoryId: "actividades", reason: "la bio-danza" },
  { keyword: "biodanza", categoryId: "actividades", reason: "la bio-danza" },
  { keyword: "danza", categoryId: "actividades", reason: "la danza consciente" },
  { keyword: "movimiento", categoryId: "actividades", reason: "el movimiento consciente" },
  { keyword: "ejercicio", categoryId: "actividades", reason: "el ejercicio espiritual" },
  { keyword: "cuerpo", categoryId: "actividades", reason: "conectar cuerpo y espíritu" },
  { keyword: "baile", categoryId: "actividades", reason: "el baile consciente" },
  { keyword: "podcast", categoryId: "podcasts", reason: "los podcasts espirituales" },
  { keyword: "audio", categoryId: "podcasts", reason: "contenido en audio" },
  { keyword: "escuchar", categoryId: "podcasts", reason: "escuchar contenido espiritual" },
  { keyword: "acupuntura", categoryId: "medicina", reason: "la acupuntura" },
  { keyword: "osteopatía", categoryId: "medicina", reason: "la osteopatía" },
  { keyword: "osteopatia", categoryId: "medicina", reason: "la osteopatía" },
  { keyword: "ayurveda", categoryId: "medicina", reason: "la medicina ayurvédica" },
  { keyword: "homeopatía", categoryId: "medicina", reason: "la homeopatía" },
  { keyword: "homeopatia", categoryId: "medicina", reason: "la homeopatía" },
  { keyword: "naturopatía", categoryId: "medicina", reason: "la naturopatía" },
  { keyword: "naturopatia", categoryId: "medicina", reason: "la naturopatía" },
  { keyword: "herbolaria", categoryId: "medicina", reason: "la herbolaria medicinal" },
  { keyword: "dolor", categoryId: "medicina", reason: "tratar el dolor de forma natural" },
  { keyword: "salud", categoryId: "medicina", reason: "la medicina alternativa" },
  { keyword: "cábala", categoryId: "crecimiento", reason: "el estudio de la Cábala" },
  { keyword: "cabala", categoryId: "crecimiento", reason: "el estudio de la Cábala" },
  { keyword: "astrologia", categoryId: "terapias", reason: "la astrología espiritual" },
  { keyword: "cartas", categoryId: "tarot", reason: "la lectura de cartas y oráculos" },
  { keyword: "oculto", categoryId: "ocultismo", reason: "el ocultismo y las ciencias ocultas" },
  { keyword: "ocultismo", categoryId: "ocultismo", reason: "el ocultismo y sus tradiciones" },
  { keyword: "satanismo", categoryId: "ocultismo", reason: "el estudio del satanismo" },
  { keyword: "demonio", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "demonología", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "demonologia", categoryId: "ocultismo", reason: "la demonología" },
  { keyword: "brujería", categoryId: "ocultismo", reason: "la brujería y el neopaganismo" },
  { keyword: "brujeria", categoryId: "ocultismo", reason: "la brujería y el neopaganismo" },
  { keyword: "wicca", categoryId: "ocultismo", reason: "la Wicca y el neopaganismo" },
  { keyword: "grimorio", categoryId: "ocultismo", reason: "los grimorios y la magia ritual" },
  { keyword: "salomón", categoryId: "ocultismo", reason: "la Llave de Salomón y los grimorios" },
  { keyword: "salomon", categoryId: "ocultismo", reason: "la Llave de Salomón y los grimorios" },
  { keyword: "lucifer", categoryId: "ocultismo", reason: "la figura de Lucifer en el ocultismo" },
  { keyword: "magia negra", categoryId: "ocultismo", reason: "la magia negra y los rituales" },
  { keyword: "culto", categoryId: "ocultismo", reason: "los cultos ocultistas" },
  { keyword: "secta", categoryId: "ocultismo", reason: "las sectas y grupos esotéricos" },
  { keyword: "espiritismo", categoryId: "ocultismo", reason: "el espiritismo y la comunicación espiritual" },
  { keyword: "oscuro", categoryId: "ocultismo", reason: "la espiritualidad de la sombra" },
  { keyword: "sombra", categoryId: "ocultismo", reason: "el trabajo con la sombra espiritual" },
  { keyword: "torá", categoryId: "tradiciones", reason: "el estudio de la Torá" },
  { keyword: "tora", categoryId: "tradiciones", reason: "el estudio de la Torá" },
  { keyword: "biblia", categoryId: "tradiciones", reason: "el estudio de la Biblia" },
  { keyword: "bíblico", categoryId: "tradiciones", reason: "los textos bíblicos y su exégesis" },
  { keyword: "biblico", categoryId: "tradiciones", reason: "los textos bíblicos y su exégesis" },
  { keyword: "evangelio", categoryId: "tradiciones", reason: "el estudio de los Evangelios" },
  { keyword: "exégesis", categoryId: "tradiciones", reason: "la exégesis de las sagradas escrituras" },
  { keyword: "exegesis", categoryId: "tradiciones", reason: "la exégesis de las sagradas escrituras" },
  { keyword: "rabino", categoryId: "tradiciones", reason: "la tradición rabínica" },
  { keyword: "talmud", categoryId: "tradiciones", reason: "el estudio del Talmud" },
  { keyword: "teología", categoryId: "tradiciones", reason: "la teología y el estudio de Dios" },
  { keyword: "teologia", categoryId: "tradiciones", reason: "la teología y el estudio de Dios" },
  { keyword: "sagrada escritura", categoryId: "tradiciones", reason: "las sagradas escrituras" },
  { keyword: "pentateuco", categoryId: "tradiciones", reason: "el Pentateuco" },
  { keyword: "apóstol", categoryId: "tradiciones", reason: "las cartas apostólicas" },
  { keyword: "apostol", categoryId: "tradiciones", reason: "las cartas apostólicas" },
  { keyword: "sumerio", categoryId: "ancestral", reason: "los textos sumerios y Mesopotamia" },
  { keyword: "egipcio", categoryId: "ancestral", reason: "los textos egipcios y el Kemet" },
  { keyword: "apócrifo", categoryId: "ancestral", reason: "los evangelios apócrifos y textos prohibidos" },
  { keyword: "apocrifo", categoryId: "ancestral", reason: "los evangelios apócrifos y textos prohibidos" },
  { keyword: "gnóstico", categoryId: "ancestral", reason: "los textos gnósticos" },
  { keyword: "gnostico", categoryId: "ancestral", reason: "los textos gnósticos" },
  { keyword: "nag hammadi", categoryId: "ancestral", reason: "la Biblioteca de Nag Hammadi" },
  { keyword: "prohibido", categoryId: "ancestral", reason: "los textos prohibidos y apócrifos" },
  { keyword: "texto", categoryId: "ancestral", reason: "los textos antiguos y su estudio" },
  { keyword: "gilgamesh", categoryId: "ancestral", reason: "la Epopeya de Gilgamesh" },
  { keyword: "anunnaki", categoryId: "ancestral", reason: "los Anunnaki y la mitología sumeria" },
  { keyword: "cuneiforme", categoryId: "ancestral", reason: "las tablillas cuneiformes" },
  { keyword: "pirámide", categoryId: "ancestral", reason: "los misterios de las pirámides" },
  { keyword: "piramide", categoryId: "ancestral", reason: "los misterios de las pirámides" },
  { keyword: "kemet", categoryId: "ancestral", reason: "la sabiduría del Antiguo Egipto" },
  { keyword: "texto antiguo", categoryId: "ancestral", reason: "los textos de las civilizaciones antiguas" },
  { keyword: "hermético", categoryId: "hermetismo", reason: "la tradición hermética" },
  { keyword: "hermetico", categoryId: "hermetismo", reason: "la tradición hermética" },
  { keyword: "alquimia", categoryId: "hermetismo", reason: "la alquimia espiritual" },
  { keyword: "numerología", categoryId: "hermetismo", reason: "la numerología aplicada" },
  { keyword: "numerologia", categoryId: "hermetismo", reason: "la numerología aplicada" },
  { keyword: "gematría", categoryId: "hermetismo", reason: "la gematría" },
  { keyword: "gematria", categoryId: "hermetismo", reason: "la gematría" },
  { keyword: "árbol de la vida", categoryId: "hermetismo", reason: "el Árbol de la Vida de la Cábala" },
  { keyword: "sefirot", categoryId: "hermetismo", reason: "las 10 sefirot del Árbol de la Vida" },
  { keyword: "zohar", categoryId: "hermetismo", reason: "el Zohar y la Cábala" },
  { keyword: "pitagórico", categoryId: "hermetismo", reason: "la numerología pitagórica" },
  { keyword: "pitagorico", categoryId: "hermetismo", reason: "la numerología pitagórica" },
  { keyword: "viaje iniciático", categoryId: "viajes", reason: "los viajes iniciáticos" },
  { keyword: "viaje iniciatico", categoryId: "viajes", reason: "los viajes iniciáticos" },
  { keyword: "peregrinación", categoryId: "viajes", reason: "las peregrinaciones espirituales" },
  { keyword: "peregrinacion", categoryId: "viajes", reason: "las peregrinaciones espirituales" },
  { keyword: "peregrino", categoryId: "viajes", reason: "el camino del peregrino" },
  { keyword: "tierra santa", categoryId: "viajes", reason: "los viajes a Tierra Santa" },
  { keyword: "machu picchu", categoryId: "viajes", reason: "el viaje iniciático a Machu Picchu" },
  { keyword: "tíbet", categoryId: "viajes", reason: "los viajes espirituales al Tíbet" },
  { keyword: "tibet", categoryId: "viajes", reason: "los viajes espirituales al Tíbet" },
  { keyword: "sedona", categoryId: "viajes", reason: "los viajes a Sedona" },
  { keyword: "santiago", categoryId: "viajes", reason: "el Camino de Santiago" },
  { keyword: "camino de santiago", categoryId: "viajes", reason: "el Camino de Santiago" },
  { keyword: "lugar sagrado", categoryId: "viajes", reason: "los lugares sagrados del mundo" },
  { keyword: "destino", categoryId: "viajes", reason: "el viaje espiritual y la transformación" },
  { keyword: "feria", categoryId: "zona", reason: "las ferias holísticas y esotéricas" },
  { keyword: "mercado", categoryId: "zona", reason: "los mercados esotéricos" },
  { keyword: "evento", categoryId: "zona", reason: "eventos espirituales en tu zona" },
  { keyword: "círculo", categoryId: "zona", reason: "los círculos de mujeres y encuentros" },
  { keyword: "circulo", categoryId: "zona", reason: "los círculos de mujeres y encuentros" },
  { keyword: "encuentro", categoryId: "zona", reason: "encuentros espirituales" },
  { keyword: "charla", categoryId: "zona", reason: "charlas y conferencias espirituales" },
  { keyword: "cerca de ti", categoryId: "zona", reason: "eventos y profesionales cerca de ti" },
  { keyword: "cristal", categoryId: "materiales", reason: "los cristales y piedras energéticas" },
  { keyword: "cuenco", categoryId: "materiales", reason: "los cuencos tibetanos e instrumentos" },
  { keyword: "incienso", categoryId: "materiales", reason: "inciensos y sahumerios naturales" },
  { keyword: "vela", categoryId: "materiales", reason: "velas rituales y artesanales" },
  { keyword: "mandala", categoryId: "materiales", reason: "mandalas, yantras y arte sagrado" },
  { keyword: "herbolaria", categoryId: "materiales", reason: "la herbolaria y las plantas medicinales" },
  { keyword: "libro espiritual", categoryId: "materiales", reason: "libros de espiritualidad y ocultismo" },
  { keyword: "aceite esencial", categoryId: "materiales", reason: "los aceites esenciales" },
  { keyword: "piedra", categoryId: "materiales", reason: "piedras y minerales" },
  { keyword: "mineral", categoryId: "materiales", reason: "minerales y fósiles" },
  { keyword: "artesanía", categoryId: "materiales", reason: "artesanía espiritual" },
  { keyword: "artesania", categoryId: "materiales", reason: "artesanía espiritual" },
  { keyword: "material espiritual", categoryId: "materiales", reason: "materiales para tu práctica espiritual" },
  { keyword: "altar", categoryId: "materiales", reason: "elementos para tu altar espiritual" },
  { keyword: "tarot", categoryId: "tarot", reason: "la lectura del tarot" },
  { keyword: "adivinación", categoryId: "tarot", reason: "la adivinación y la videncia" },
  { keyword: "adivinacion", categoryId: "tarot", reason: "la adivinación y la videncia" },
  { keyword: "oráculo", categoryId: "tarot", reason: "los oráculos y las cartas" },
  { keyword: "oraculo", categoryId: "tarot", reason: "los oráculos y las cartas" },
  { keyword: "runas", categoryId: "tarot", reason: "las runas nórdicas" },
  { keyword: "quiromancia", categoryId: "tarot", reason: "la lectura de manos" },
  { keyword: "vidente", categoryId: "tarot", reason: "la videncia y la clarividencia" },
  { keyword: "videncia", categoryId: "tarot", reason: "la videncia espiritual" },
  { keyword: "carta natal", categoryId: "tarot", reason: "la carta astral" },
  { keyword: "astrología", categoryId: "tarot", reason: "la astrología predictiva" },
  { keyword: "astrologia", categoryId: "tarot", reason: "la astrología predictiva" },
  { keyword: "futuro", categoryId: "tarot", reason: "conocer tu futuro" },
  { keyword: "predicción", categoryId: "tarot", reason: "las predicciones" },
  { keyword: "prediccion", categoryId: "tarot", reason: "las predicciones" },
  { keyword: "i ching", categoryId: "tarot", reason: "el I Ching y la sabiduría oriental" },
  { keyword: "feng shui", categoryId: "tarot", reason: "el Feng Shui" },
  { keyword: "registro akáshico", categoryId: "tarot", reason: "los registros akáshicos" },
  { keyword: "vidas pasadas", categoryId: "tarot", reason: "las vidas pasadas" },
  { keyword: "medium", categoryId: "tarot", reason: "la mediumnidad y el contacto espiritual" },
  { keyword: "mediumnidad", categoryId: "tarot", reason: "la mediumnidad y el contacto espiritual" },
  { keyword: "péndulo", categoryId: "tarot", reason: "la radiestesia con péndulo" },
  { keyword: "pendulo", categoryId: "tarot", reason: "la radiestesia con péndulo" },
]

const CATEGORY_INFO: Record<string, { name: string; icon: string }> = {
  yoga: { name: "Yoga", icon: "🧘" },
  reiki: { name: "Reiki", icon: "✨" },
  terapias: { name: "Terapias Alternativas", icon: "🌿" },
  meditacion: { name: "Meditación & Mindfulness", icon: "🪷" },
  crecimiento: { name: "Crecimiento Personal", icon: "🌱" },
  retiros: { name: "Eventos & Retiros", icon: "🔥" },
  actividades: { name: "Actividades Físicas Espirituales", icon: "💃" },
  podcasts: { name: "Podcasts Espirituales", icon: "🎙️" },
  medicina: { name: "Medicina Alternativa", icon: "🏥" },
  ocultismo: { name: "Ocultismo", icon: "🔮" },
  tradiciones: { name: "Tradiciones Sagradas", icon: "📜" },
  ancestral: { name: "Sabiduría Ancestral", icon: "🏛️" },
  hermetismo: { name: "Hermetismo y Numerología", icon: "🔢" },
  viajes: { name: "Viajes Iniciáticos", icon: "✈️" },
  zona: { name: "En tu Zona", icon: "📍" },
  materiales: { name: "Materiales", icon: "💎" },
  tarot: { name: "Tarot y Adivinación", icon: "🃏" },
}

export function AIAdvisor() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string; matches?: CategoryMatch[] }[]
  >([
    {
      role: "ai",
      text: "¡Hola! Cuéntame qué estás buscando o qué necesitas en este momento de tu vida. Por ejemplo: 'quiero reducir mi ansiedad', 'me interesan los textos ocultos y prohibidos', 'quiero estudiar la Cábala y la numerología', 'busco un viaje iniciático a Egipto' o 'necesito un retiro en la naturaleza'. Te recomendaré la categoría perfecta para ti. 🌟",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
          word.length >= 5 &&
          mapping.keyword.length >= 4 &&
          (word.startsWith(mapping.keyword) || mapping.keyword.startsWith(word))
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
      .slice(0, 3)

    return results
  }

  function handleSend() {
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userText }])
    setLoading(true)

    setTimeout(() => {
      const matches = analyzeText(userText)

      if (matches.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "No tengo una recomendación clara con lo que me cuentas. Prueba a ser más específico. Por ejemplo: dime si te interesa el ocultismo 🔮, los textos bíblicos 📜, la sabiduría egipcia o sumeria 🏛️, la Cábala o la numerología 🔢, los viajes iniciáticos ✈️, o tal vez el yoga 🧘, la meditación 🪷, terapias 🌿, retiros 🔥, actividades físicas 💃, medicina alternativa 🏥, crecimiento personal 🌱, Reiki ✨ o podcasts 🎙️.",
          },
        ])
      } else {
        const recommendations = matches
          .map(
            (m, i) =>
              `${i + 1}. ${m.icon} **${m.name}** — ${m.reason}`
          )
          .join("\n")

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Según lo que me cuentas, te recomiendo explorar estas categorías:\n\n${recommendations}\n\n¿Quieres que te lleve a alguna de ellas?`,
            matches,
          },
        ])
      }
      setLoading(false)
    }, 1200)
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
        title="¿Necesitas ayuda para encontrar lo que buscas?"
      >
        🤖
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-2xl border border-white/10 bg-[#0f0a1a]/95 shadow-2xl shadow-purple-600/20 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-amber-600/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-sm font-semibold text-white">Guía Espiritual</p>
            <p className="text-xs text-purple-300/50">
              Te ayudo a encontrar tu camino
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

      {/* Messages */}
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
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                  ●
                </span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                  ●
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe lo que buscas..."
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
      </div>
    </div>
  )
}
