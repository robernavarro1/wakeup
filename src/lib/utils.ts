export const PLATFORM_FEE_PERCENT = 15

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100)
}

export function calculateFee(amount: number): number {
  return Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
}

export function generateZoomLink(): string {
  const id = Math.random().toString(36).substring(2, 12)
  return `https://zoom.us/j/${id}`
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
