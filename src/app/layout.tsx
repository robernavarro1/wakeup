import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/AuthProvider"
import { Navbar } from "@/components/Navbar"
import { AIAdvisorWrapper } from "@/components/AIAdvisorWrapper"
import { CookieConsentBanner } from "@/components/CookieConsentBanner"
import { SocialBar } from "@/components/SocialLinks"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Wakeup — Conecta con profesionales holísticos",
    template: "%s — Wakeup",
  },
  description: "El lugar donde profesionales del mundo holístico y espiritual comparten su sabiduría. Yoga, Reiki, meditación, Tai Chi, constelaciones, hipnosis, tarot, retiros y mucho más.",
  keywords: ["yoga", "reiki", "meditación", "holístico", "espiritual", "profesionales", "terapias", "bienestar", "constelaciones", "tarot", "retiros"],
  authors: [{ name: "Wakeup" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Wakeup",
    title: "Wakeup — Conecta con profesionales holísticos",
    description: "El lugar donde profesionales del mundo holístico y espiritual comparten su sabiduría.",
    url: "https://wakeup-app.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakeup — Conecta con profesionales holísticos",
    description: "El lugar donde profesionales del mundo holístico y espiritual comparten su sabiduría.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <Navbar />
          <SocialBar />
          <main className="flex-1">{children}</main>
          <AIAdvisorWrapper />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
