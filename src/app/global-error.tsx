"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a0b2e",
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "26rem" }}>
          <div style={{ fontSize: "3rem", opacity: 0.4 }}>☥</div>
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>
            Algo no ha ido bien
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: "rgba(216, 180, 254, 0.6)",
            }}
          >
            Ha ocurrido un error inesperado. Inténtalo de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "linear-gradient(to right, #9333ea, #d97706)",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
