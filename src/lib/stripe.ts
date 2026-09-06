import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
})

/**
 * Comisión que retiene la plataforma en reservas y ventas de la tienda.
 *
 * Con un 0 se transfiere el importe íntegro al profesional, pero la comisión
 * que cobra Stripe (en torno al 1,5% + 0,25 € por cobro en tarjetas europeas)
 * la asume la plataforma, de modo que cada transacción sale a pérdidas.
 *
 * Se configura con PLATFORM_FEE_PERCENT para poder ajustarla sin desplegar.
 */
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 0)
