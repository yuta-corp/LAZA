import type { Metadata } from "next"
import { Inter, Geist_Mono, Newsreader } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
})

const TITLE = "Laza — Dénoncer la corruption à Madagascar"
const DESCRIPTION =
  "Plateforme de dénonciation anonyme de corruption à Madagascar. Signalez des faits avec des preuves, vérifiés avant publication et partageables sur les réseaux sociaux."

/**
 * Les icônes (favicon, icône Apple) sont fournies par les fichiers de
 * convention `app/icon.png` et `app/apple-icon.png`.
 */
export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s — Laza",
  },
  description: DESCRIPTION,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Laza",
    locale: "fr_MG",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "Laza — signalement anonyme de corruption à Madagascar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        newsreader.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <CookieConsent />
            <Toaster position="bottom-center" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}