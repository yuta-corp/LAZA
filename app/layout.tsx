import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Laza — Dénoncer la corruption à Madagascar",
    template: "%s — Laza",
  },
  description:
    "Plateforme de dénonciation anonyme de corruption à Madagascar. Signalez des faits avec des preuves, vérifiés avant publication et partageables sur les réseaux sociaux.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/favicon.ico",
    apple: "/log.png",
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
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <TooltipProvider>
            <Header />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
            <Footer />
            <Toaster position="bottom-center" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}