import { NextResponse } from "next/server"

/**
 * Diagnóstico del estado del envío de emails.
 *
 * Consulta a Resend qué dominios hay dados de alta y si están verificados.
 * Sirve para saber por qué unos destinatarios reciben los correos y otros no:
 * con el dominio sin verificar, Resend solo entrega al titular de la cuenta y
 * descarta el resto sin devolver ningún error.
 *
 * Protegido por un token para que no quede expuesto públicamente. No revela la
 * clave de API, solo el estado de verificación.
 */
const DIAG_TOKEN = "wk-diag-7f3a91c4e8"

/**
 * Da de alta wakeup-app.com en Resend y devuelve los registros DNS que hay que
 * publicar. Usa la clave que ya está en el entorno, así no hace falta manejar
 * credenciales nuevas.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get("token") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === "re_placeholder") {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 400 })
  }

  try {
    const res = await fetch("https://api.resend.com/domains", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "wakeup-app.com", region: "eu-west-1" }),
    })

    const body = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        estadoHttp: res.status,
        respuesta: body,
        pista:
          res.status === 401 || res.status === 403
            ? "La clave de API no tiene permisos para gestionar dominios. Hace falta una clave con acceso completo (Full access)."
            : "Revisa la respuesta de Resend.",
      })
    }

    return NextResponse.json({
      ok: true,
      dominioId: body?.id,
      estado: body?.status,
      registrosDNS: body?.records,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get("token") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const configured = Boolean(apiKey && apiKey !== "re_placeholder")

  if (!configured) {
    return NextResponse.json({
      resendApiKey: "NO CONFIGURADA",
      mailFrom: process.env.RESEND_FROM || "Wakeup <hola@wakeup-app.com>",
      diagnostico: "Falta RESEND_API_KEY. No se puede enviar ningún email.",
    })
  }

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    })

    const body = await res.json()
    const domains = (body?.data ?? []) as Array<{
      name: string
      status: string
      region?: string
    }>

    const mailFrom = process.env.RESEND_FROM || "Wakeup <hola@wakeup-app.com>"
    const sendingDomain = mailFrom.split("@")[1]?.replace(">", "").trim() ?? ""
    const match = domains.find((d) => d.name === sendingDomain)

    let diagnostico: string
    if (!match) {
      diagnostico =
        `El dominio "${sendingDomain}" NO está dado de alta en Resend. ` +
        `Los emails a terceros se descartan.`
    } else if (match.status !== "verified") {
      diagnostico =
        `El dominio "${sendingDomain}" está en estado "${match.status}", no verificado. ` +
        `Resend solo entrega al titular de la cuenta; el resto se descarta en silencio. ` +
        `Hay que pulsar "Verify DNS Records" en resend.com/domains.`
    } else {
      diagnostico = `Todo correcto: "${sendingDomain}" está verificado. Se puede enviar a cualquier destinatario.`
    }

    return NextResponse.json({
      resendApiKey: "configurada",
      remitente: mailFrom,
      dominioDeEnvio: sendingDomain,
      dominiosEnResend: domains.map((d) => ({ nombre: d.name, estado: d.status })),
      diagnostico,
    })
  } catch (e) {
    return NextResponse.json({
      resendApiKey: "configurada",
      error: e instanceof Error ? e.message : "Error consultando Resend",
    })
  }
}
