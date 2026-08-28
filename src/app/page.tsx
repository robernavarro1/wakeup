import Link from "next/link"
import { FeaturedCarousel } from "@/components/FeaturedCarousel"
import { SocialFooter } from "@/components/SocialLinks"

const heroBtnStyle = `
  .hero-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .hero-btn:hover {
    background: linear-gradient(135deg, #7c3aed, #a855f7, #f59e0b);
    border-color: rgba(168,85,247,0.4);
    box-shadow: 0 0 30px rgba(124,58,237,0.45), 0 0 60px rgba(168,85,247,0.15);
    transform: scale(1.05);
  }
`

const categories = [
  { name: "Todas", icon: "☥", href: "/explore" },
  { name: "En tu Zona", icon: "⊙", href: "/explore?c=zona" },
  { name: "Podcasts", icon: "♪", href: "/explore?c=podcasts" },
  { name: "Despertar del Cuerpo", icon: "☉", href: "/explore?g=cuerpo" },
  { name: "Despertar del Alma", icon: "☯", href: "/explore?g=alma" },
  { name: "Despertar del Conocimiento", icon: "◇", href: "/explore?g=conocimiento" },
  { name: "Despertar a lo Desconocido", icon: "☆", href: "/explore?g=desconocido" },
  { name: "Despertar de lo Oculto", icon: "☾", href: "/explore?g=oculto" },
  { name: "Experiencias para Despertar", icon: "✦", href: "/explore?g=experiencias" },
  { name: "Materiales", icon: "◆", href: "/explore?c=materiales" },
  { name: "Tienda", icon: "⊞", href: "/products" },
]

export default function Home() {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: heroBtnStyle }} />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
          <div className="relative text-center">
            <div className="mb-6 text-6xl opacity-60">☥</div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-7xl">
              Despierta tu
              <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                {" "}conciencia
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-purple-200/60 sm:text-lg">
              El lugar donde profesionales del mundo holístico y espiritual
              comparten su sabiduría. Yoga, Reiki, meditación, Tai Chi,
              constelaciones, hipnosis, tarot, retiros y mucho más para
              elevar tu nivel de conciencia.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="hero-btn w-full sm:w-auto rounded-xl px-8 py-4 text-base font-semibold text-white"
              >
                Comienza a explorar
              </Link>
              <Link
                href="/auth/register?role=PROFESSIONAL"
                className="hero-btn w-full sm:w-auto rounded-xl px-8 py-4 text-base font-semibold text-white"
              >
                Soy profesional
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Categorías</h2>
            <p className="mt-2 text-sm text-purple-200/50 sm:text-base">
              Elige tu camino y encuentra profesionales
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 text-center transition hover:border-purple-500/30 hover:bg-white/[0.05] sm:px-4 sm:py-5"
              >
                <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-white sm:text-base">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedCarousel />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-5xl opacity-40">☥</span>
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

      {/* Síguenos */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-4xl opacity-40">☥</span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Síguenos en redes
            </h2>
            <p className="mt-3 text-sm text-purple-200/50">
              Contenido diario sobre meditación, yoga, Reiki, tarot y despertar espiritual.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <SocialFooter />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-xs text-purple-300/50">
            <span className="text-sm text-purple-300/30">☥</span>
            <p>Contacto: hola@wakeup-app.com</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/privacy" className="hover:text-purple-300 transition">Privacidad</Link>
              <Link href="/cookies" className="hover:text-purple-300 transition">Cookies</Link>
              <Link href="/terms" className="hover:text-purple-300 transition">Términos</Link>
              <Link href="/data" className="hover:text-purple-300 transition">Tus datos</Link>
            </div>
            <p>Wakeup &copy; {new Date().getFullYear()} &mdash; Despierta tu conciencia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
