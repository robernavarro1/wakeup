import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const start = Date.now()
  const dbOk = await (async () => {
    try {
      const { Pool } = await import("pg")
      const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "", ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 5000 })
      await pool.query("SELECT 1")
      await pool.end()
      return true
    } catch { return false }
  })()

  return NextResponse.json({
    status: dbOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: { database: dbOk ? "ok" : "error", responseTime: Date.now() - start },
  }, { status: dbOk ? 200 : 503 })
}
