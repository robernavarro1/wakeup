import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/AuthProvider"
import { Navbar } from "@/components/Navbar"
import { AIAdvisorWrapper } from "@/components/AIAdvisorWrapper"
import { CookieConsentBanner } from "@/components/CookieConsentBanner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Wakeup - Conecta con profesionales",
  description: "Encuentra profesionales, reserva sesiones, aprende y crece",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
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
          <main className="flex-1">{children}</main>
          <AIAdvisorWrapper />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
