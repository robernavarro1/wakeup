import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos y Condiciones — Wakeup",
  description: "Términos y condiciones de uso de Wakeup",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-purple-400 hover:text-purple-300"
      >
        &larr; Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
      <p className="mt-2 text-sm text-purple-300/50">Última actualización: junio 2026</p>

      <div className="mt-10 space-y-8 text-sm text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Información general</h2>
          <p>
            Wakeup es una plataforma que conecta a clientes con profesionales del
            bienestar holístico. El responsable de la plataforma es Roberto
            Navarro, autónomo en España.
          </p>
          <p className="mt-2">
            Al registrarte y utilizar Wakeup, aceptas estos términos en su
            totalidad. Si no estás de acuerdo, no debes usar la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Definiciones</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Plataforma:</strong> el sitio web wakeup-app.com y sus servicios asociados.</li>
            <li><strong>Cliente:</strong> usuario que busca y reserva servicios de profesionales.</li>
            <li><strong>Profesional:</strong> usuario que ofrece servicios a través de la plataforma.</li>
            <li><strong>Servicio:</strong> sesión, consulta o actividad ofrecida por un profesional.</li>
            <li><strong>Producto:</strong> bien físico o digital vendido a través de la tienda.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Registro y cuenta</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Debes ser mayor de 14 años para registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>La información que proporciones debe ser veraz y actualizada.</li>
            <li>Wakeup se reserva el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Suscripciones para profesionales</h2>
          <p>Los profesionales pueden contratar planes de suscripción:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Semilla (20€/mes):</strong> 1 categoría, 1 disciplina, máximo 3 servicios.</li>
            <li><strong>Árbol (40€/mes):</strong> 3 categorías, 3 disciplinas, máximo 10 servicios.</li>
            <li><strong>Bosque (70€/mes):</strong> categorías y disciplinas ilimitadas, servicios ilimitados.</li>
          </ul>
          <p className="mt-2">
            Los nuevos profesionales pueden disfrutar de un período de prueba
            gratuito. Al finalizar el período de prueba, se cobrará el plan
            seleccionado automáticamente. Puedes cancelar tu suscripción en
            cualquier momento desde tu perfil.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Publicidad</h2>
          <p>
            Los planes publicitarios (Destello, Brillo, Resplandor, Luz) son
            independientes de la suscripción profesional. Cualquier usuario con
            perfil profesional puede contratar publicidad para aparecer destacado
            en la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Reservas y pagos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Las reservas se pagan por adelantado a través de Stripe.</li>
            <li>Wakeup no cobra comisión sobre las reservas — el profesional recibe el 100% del importe.</li>
            <li>Las políticas de cancelación son establecidas por cada profesional.</li>
            <li>Los reembolsos se gestionan caso por caso. Contacta con hola@wakeup-app.com.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Productos (tienda)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Los productos pueden ser vendidos directamente por profesionales o ser enlaces de afiliado (Amazon).</li>
            <li>Los enlaces de afiliado a Amazon.es se identifican claramente.</li>
            <li>Wakeup no se responsabiliza de los productos adquiridos a través de enlaces de afiliado.</li>
            <li>Las compras de productos físicos están sujetas a la disponibilidad del vendedor.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Naturaleza de la plataforma</h2>
          <p>
            Wakeup es una plataforma tecnológica que actúa exclusivamente como
            intermediaria entre profesionales y clientes (estudiantes). No
            proporcionamos, impartimos, supervisamos ni evaluamos ninguno de los
            servicios, cursos, viajes, retiros, talleres, eventos, actividades o
            sesiones que se publicitan o contratan a través de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Relación con los profesionales</h2>
          <p>
            Los profesionales que utilizan Wakeup son proveedores de servicios
            independientes. No existe relación laboral, mercantil, de sociedad ni
            de agencia entre Wakeup y los profesionales. Cada profesional es el
            único responsable de:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>La calidad, seguridad e idoneidad de los servicios que ofrece</li>
            <li>El cumplimiento de todas las licencias, permisos y habilitaciones legales requeridas</li>
            <li>Su propia fiscalidad y obligaciones con la Seguridad Social</li>
            <li>La veracidad de la información publicada en su perfil</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">10. Limitación de responsabilidad</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Wakeup no se hace responsable de los servicios, cursos, viajes, retiros, talleres, eventos o cualquier actividad contratada a través de la plataforma.</li>
            <li>Wakeup no se hace responsable de daños, lesiones, pérdidas o perjuicios que pudieran derivarse de la participación en cualquier actividad ofrecida por un profesional.</li>
            <li>Wakeup no verifica ni garantiza la cualificación, titulación o idoneidad de los profesionales.</li>
            <li>Wakeup no se hace responsable del contenido publicado por los profesionales en sus perfiles.</li>
            <li>Wakeup no garantiza la disponibilidad continua ni el funcionamiento sin errores de la plataforma.</li>
            <li>Wakeup no se hace responsable de daños directos o indirectos derivados del uso de la plataforma, incluyendo pero no limitado a pérdida de datos o lucro cesante.</li>
          </ul>
          <p className="mt-3 text-purple-200/60">
            Al utilizar Wakeup, clientes y profesionales aceptan que la relación
            contractual se establece exclusivamente entre ellos, siendo Wakeup un
            mero canal de conexión y procesamiento de pagos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">11. Propiedad intelectual</h2>
          <p>
            El contenido de la plataforma (logos, diseño, texto) es propiedad de
            Wakeup. Los profesionales conservan los derechos sobre el contenido
            que publican en sus perfiles.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">12. Modificaciones</h2>
          <p>
            Wakeup se reserva el derecho de modificar estos términos en cualquier
            momento. Los cambios serán notificados a los usuarios registrados por
            email. El uso continuado de la plataforma después de los cambios
            constituye la aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">13. Legislación aplicable</h2>
          <p>
            Estos términos se rigen por la legislación española. Para cualquier
            controversia, las partes se someten a los juzgados y tribunales de la
            localidad del responsable (España).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">14. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, escríbenos a{" "}
            <a href="mailto:hola@wakeup-app.com" className="text-purple-400 underline">hola@wakeup-app.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
