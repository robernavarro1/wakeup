import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidad — Wakeup",
  description: "Política de privacidad de Wakeup",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-purple-400 hover:text-purple-300"
      >
        &larr; Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-purple-300/50">Última actualización: junio 2026</p>

      <div className="mt-10 space-y-8 text-sm text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Responsable del tratamiento</h2>
          <p>
            <strong>Responsable:</strong> Roberto Navarro<br />
            <strong>NIF:</strong> (pendiente de alta como autónomo)<br />
            <strong>Email:</strong> hola@wakeup-app.com
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Datos que recopilamos</h2>
          <p>Podemos recopilar los siguientes datos personales:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Nombre y apellidos</li>
            <li>Dirección de email</li>
            <li>Contraseña (almacenada de forma cifrada)</li>
            <li>Datos de perfil profesional (si aplica): título, categorías, disciplinas, especialidades, ciudades, disponibilidad, precio</li>
            <li>Datos de reservas y compras</li>
            <li>Identificador de cuenta de Stripe Connect (para pagos a profesionales)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Finalidad y base legal</h2>
          <p>Tratamos tus datos para:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Gestión de la cuenta:</strong> registrarte, identificarte y gestionar tu perfil (base legal: ejecución del contrato)</li>
            <li><strong>Procesar reservas y pagos:</strong> conectar clientes con profesionales y procesar pagos a través de Stripe (base legal: ejecución del contrato)</li>
            <li><strong>Envío de emails transaccionales:</strong> confirmaciones de reserva, notificaciones de pago (base legal: ejecución del contrato)</li>
            <li><strong>Gestión de suscripciones y campañas publicitarias:</strong> para profesionales que contratan planes (base legal: ejecución del contrato)</li>
            <li><strong>Cumplir obligaciones legales:</strong> facturación, prevención de fraude (base legal: obligación legal)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Destinatarios de los datos</h2>
          <p>Compartimos tus datos con los siguientes terceros cuando sea necesario:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Stripe:</strong> procesamiento de pagos. Consulta su política de privacidad en <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">stripe.com/es/privacy</a>.</li>
            <li><strong>Resend:</strong> envío de emails transaccionales.</li>
            <li><strong>Neon (PostgreSQL):</strong> alojamiento de la base de datos.</li>
            <li><strong>Vercel:</strong> alojamiento de la aplicación.</li>
          </ul>
          <p className="mt-3">No vendemos tus datos personales a terceros bajo ninguna circunstancia.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Conservación de datos</h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa en Wakeup.
            Una vez eliminada la cuenta, conservaremos únicamente aquellos datos
            necesarios para cumplir obligaciones legales (facturación, prevención de
            fraude) durante el plazo legalmente exigido (generalmente 5 años).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Tus derechos</h2>
          <p>Puedes ejercer tus derechos de protección de datos contactando a hola@wakeup-app.com:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos tenemos tuyos</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos</li>
            <li><strong>Limitación:</strong> restringir el tratamiento</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos</li>
          </ul>
          <p className="mt-3">
            También tienes derecho a presentar una reclamación ante la Agencia
            Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">www.aepd.es</a>).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas adecuadas para proteger
            tus datos personales: cifrado de contraseñas (bcrypt), conexiones HTTPS,
            y acceso restringido a la base de datos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Menores de edad</h2>
          <p>
            El servicio está dirigido a mayores de 14 años. Los menores de 14 años
            necesitan autorización parental para registrarse. No recopilamos
            conscientemente datos de menores de 14 años sin consentimiento.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Contacto</h2>
          <p>
            Para cualquier consulta sobre privacidad, escríbenos a{" "}
            <a href="mailto:hola@wakeup-app.com" className="text-purple-400 underline">hola@wakeup-app.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
