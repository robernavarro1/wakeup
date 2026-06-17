import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Cookies — Wakeup",
  description: "Política de cookies de Wakeup",
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-purple-400 hover:text-purple-300"
      >
        &larr; Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-white">Política de Cookies</h1>
      <p className="mt-2 text-sm text-purple-300/50">Última actualización: junio 2026</p>

      <div className="mt-10 space-y-8 text-sm text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu
            navegador cuando visitas un sitio web. Wakeup utiliza únicamente
            cookies técnicas necesarias para el funcionamiento básico de la
            plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Tipos de cookies que utilizamos</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 font-semibold text-white">Cookie</th>
                  <th className="py-2 pr-4 font-semibold text-white">Finalidad</th>
                  <th className="py-2 pr-4 font-semibold text-white">Duración</th>
                  <th className="py-2 font-semibold text-white">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-4 text-purple-300/70">next-auth.session-token</td>
                  <td className="py-3 pr-4 text-purple-300/70">Mantener la sesión iniciada</td>
                  <td className="py-3 pr-4 text-purple-300/70">Sesión / persistente</td>
                  <td className="py-3 text-purple-300/70">Técnica</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-purple-300/70">__Secure-next-auth.session-token</td>
                  <td className="py-3 pr-4 text-purple-300/70">Mantener la sesión (HTTPS)</td>
                  <td className="py-3 pr-4 text-purple-300/70">Sesión / persistente</td>
                  <td className="py-3 text-purple-300/70">Técnica</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            No utilizamos cookies de seguimiento, analítica, publicidad ni redes
            sociales. Al no usar cookies no esenciales, no necesitamos solicitar
            tu consentimiento explícito para su instalación.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Cookies de terceros</h2>
          <p>
            Wakeup no instala cookies de terceros. Sin embargo, algunos servicios
            externos que utilizamos pueden establecer sus propias cookies:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Stripe:</strong> puede establecer cookies para procesar pagos
              y prevenir fraudes. Consulta su política en{" "}
              <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">stripe.com/es/privacy</a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Gestión de cookies</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar cookies.
            Ten en cuenta que al hacerlo, algunas funcionalidades de Wakeup
            pueden dejar de funcionar correctamente (como iniciar sesión).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Contacto</h2>
          <p>
            Para cualquier pregunta sobre el uso de cookies, escríbenos a{" "}
            <a href="mailto:hola@wakeup-app.com" className="text-purple-400 underline">hola@wakeup-app.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
