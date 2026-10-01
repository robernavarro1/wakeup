"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const CONVERSION_ID = "AW-18445097426"
const CONVERSION_LABEL = "sOYLCI-42PQcENKzp9tE"

export function ConversionTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const subSuccess = searchParams.get("subscription") === "success"
    if (subSuccess) {
      // @ts-ignore
      if (typeof window.gtag === "function") {
        // @ts-ignore
        window.gtag("event", "conversion", {
          send_to: `${CONVERSION_ID}/${CONVERSION_LABEL}`,
          value: 1.0,
          currency: "USD",
        })
      }
    }
  }, [searchParams])

  return null
}
