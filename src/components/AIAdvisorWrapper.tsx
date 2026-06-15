"use client"

import dynamic from "next/dynamic"

const AIAdvisorInner = dynamic(() => import("@/components/AIAdvisor").then((m) => m.AIAdvisor), { ssr: false })

export function AIAdvisorWrapper() {
  return <AIAdvisorInner />
}
