import Link from "next/link"

const categories = [
  {
    name: "Yoga",
    icon: "🧘",
    description: "Profesores, cursos y retiros de yoga para despertar tu energía",
    href: "/explore?c=yoga",
  },
  {
    name: "Reiki",
    icon: "✨",
    description: "Sesiones, formaciones y maestría de Reiki Usui",
    href: "/explore?c=reiki",
  },
  {
    name: "Terapias Alternativas",
    icon: "🌿",
    description: "Constelaciones, flores de Bach, biomagnetismo, sanación con sonido",
    href: "/explore?c=terapias",
  },
  {
    name: "Meditación & Mindfulness",
    icon: "🪷",
    description: "Meditaciones guiadas, mindfulness y atención plena",
    href: "/explore?c=meditacion",
  },
  {
    name: "Crecimiento Personal",
    icon: "🌱",
    description: "Talleres, formaciones y desarrollo espiritual",
    href: "/explore?c=crecimiento",
  },
  {
    name: "Eventos & Retiros",
    icon: "🔥",
    description: "Retiros espirituales, ceremonias y eventos presenciales",
    href: "/explore?c=retiros",
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
          <div className="relative text-center">
            <div className="mb-6 text-6xl opacity-60">☥</div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Despierta tu
              <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                {" "}conciencia
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-purple-200/60">
              El lugar donde profesionales del mundo holístico y espiritual
              comparten su sabiduría. Yoga, Reiki, terapias, meditación,
              retiros y formaciones para elevar tu nivel de conciencia.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/explore"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
              >
                Comienza a explorar
              </Link>
              <Link
                href="/auth/register?role=PROFESSIONAL"
                className="rounded-xl border border-white/10 px-8 py-4 text-base font-semibold text-purple-200/80 transition hover:bg-white/5 hover:text-purple-200"
              >
                Soy profesional
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Explora por categoría</h2>
            <p className="mt-2 text-purple-200/50">
              Encuentra tu camino hacia el despertar
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition hover:border-purple-500/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/5"
              >
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-purple-300">
                  {cat.name}
                </h3>
                <p className="mt-2 text-sm text-purple-200/50">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-5xl opacity-40">🕉️</span>
            <h2 className="mt-6 text-3xl font-bold text-white">
              ¿Eres profesional holístico?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-purple-200/60">
              Comparte tu don con el mundo. Crea tu perfil, ofrece sesiones,
              cursos y retiros. Gestiona tu agenda y recibe pagos de forma
              segura.
            </p>
            <Link
              href="/auth/register?role=PROFESSIONAL"
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
            >
              Crear perfil profesional
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm text-purple-300/30">☥</span>
          <p className="mt-2 text-xs text-purple-300/30">
            Wakeup &copy; {new Date().getFullYear()} &mdash; Despierta tu conciencia
          </p>
        </div>
      </footer>
    </div>
  )
}
