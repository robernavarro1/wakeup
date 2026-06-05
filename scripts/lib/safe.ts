import readline from "readline"

const FINANCIAL_MODELS = ["Booking", "Order", "OrderItem", "CartItem", "ProfessionalSubscription"] as const
const USER_MODELS = ["User", "Account", "Session", "UserProfile", "ProfessionalProfile"] as const

export function isProduction(): boolean {
  const url = process.env.DATABASE_URL ?? ""
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv === "production") return true
  if (url.includes("pooler") && url.includes("neon.tech")) return true
  return false
}

export function confirmDestructive(action: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const prefix = isProduction() ? "\x1b[31m⚠ PRODUCTION\x1b[0m" : "\x1b[33m⚠ DEVELOPMENT\x1b[0m"
    rl.question(`${prefix}: ${action}. Are you sure? (yes/no): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "yes")
    })
  })
}

export async function requireNonProduction(): Promise<void> {
  if (isProduction()) {
    console.error("\x1b[31m❌ This script cannot run in production.\x1b[0m")
    console.error("   Set NODE_ENV=development or use a non-pooled database URL.")
    process.exit(1)
  }
}

export function isFinancialModel(model: string): boolean {
  return (FINANCIAL_MODELS as readonly string[]).includes(model)
}

export function isUserModel(model: string): boolean {
  return (USER_MODELS as readonly string[]).includes(model)
}
