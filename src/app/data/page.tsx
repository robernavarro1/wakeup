import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Gestión de Datos — Wakeup",
  description: "Gestión de datos personales y consentimiento en Wakeup",
}

export default function DataPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-purple-400 hover:text-purple-300"
      >
        &larr; Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-white">Gestión de Datos y Consentimiento</h1>
      <p className="mt-2 text-sm text-purple-300/50">Última actualización: junio 2026</p>

      <div className="mt-10 space-y-8 text-sm text-purple-200/80 leading-relaxed">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Tu control sobre tus datos</h2>
          <p>
            En Wakeup creemos en la transparencia total. Queremos que tengas
            control absoluto sobre tus datos personales. A continuación te
            explicamos cómo gestionarlos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Consentimiento</h2>
          <p>
            Al registrarte en Wakeup, aceptas nuestra{" "}
            <Link href="/privacy" className="text-purple-400 underline">Política de Privacidad</Link>{" "}
            y nuestros{" "}
            <Link href="/terms" className="text-purple-400 underline">Términos y Condiciones</Link>.
            Esto constituye tu consentimiento para el tratamiento de tus datos
            personales según lo descrito en dichos documentos.
          </p>
          <p className="mt-2">
            Puedes retirar tu consentimiento en cualquier momento solicitando la
            eliminación de tu cuenta, pero esto puede impedir que utilices la
            plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Cómo ejercer tus derechos</h2>
          <p>Para ejercer cualquiera de tus derechos RGPD, envía un email a hola@wakeup-app.com con:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Asunto: "Ejercicio de derecho RGPD"</li>
            <li>Tu nombre completo y email asociado a la cuenta</li>
            <li>El derecho que deseas ejercer (acceso, rectificación, supresión, etc.)</li>
            <li>Cualquier información adicional necesaria para procesar tu solicitud</li>
          </ul>
          <p className="mt-2">
            Responderemos a tu solicitud en un plazo máximo de 30 días.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Eliminación de cuenta</h2>
          <p>Puedes solicitar la eliminación de tu cuenta y datos asociados:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Envía un email a hola@wakeup-app.com solicitando la baja</li>
            <li>Eliminaremos tus datos personales en un plazo de 30 días</li>
            <li>Conservaremos únicamente los datos necesarios para cumplir obligaciones legales (facturación, prevención de fraude)</li>
          </ul>
          <p className="mt-2">
            <strong>Importante:</strong> la eliminación de tu cuenta como profesional
            cancelará tus suscripciones activas y campañas publicitarias en curso,
            sin derecho a reembolso por el período no disfrutado.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Descarga de tus datos (portabilidad)</h2>
          <p>
            Puedes solicitar una copia de todos tus datos personales en formato
            estructurado (JSON) enviando un email a hola@wakeup-app.com con el
            asunto "Portabilidad de datos". Te enviaremos tus datos en un plazo
            de 30 días.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Seguridad de los datos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tu contraseña se almacena cifrada con bcrypt (12 rondas)</li>
            <li>Todas las conexiones son HTTPS</li>
            <li>Los pagos se procesan a través de Stripe, que cumple con PCI DSS</li>
            <li>El acceso a la base de datos está restringido y protegido</li>
            <li>No compartimos tus datos con terceros para fines publicitarios</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Actualizaciones de esta política</h2>
          <p>
            Te notificaremos por email cualquier cambio importante en cómo
            gestionamos tus datos. El uso continuado de la plataforma después de
            las modificaciones implica la aceptación de las mismas.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Contacto</h2>
          <p>
            Delegado de protección de datos (DPO): Roberto Navarro<br />
            Email:{" "}
            <a href="mailto:hola@wakeup-app.com" className="text-purple-400 underline">hola@wakeup-app.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
