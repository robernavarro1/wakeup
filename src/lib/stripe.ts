import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-03-31.basil" as any,
  typescript: true,
})

export const PLATFORM_FEE_PERCENT = 15

export function calculateFee(amount: number): number {
  return Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
}
