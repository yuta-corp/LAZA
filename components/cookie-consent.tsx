"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Cookie } from "lucide-react"

const CONSENT_COOKIE = "laza_cookie_consent"
const ONE_YEAR = 60 * 60 * 24 * 365

function readConsent(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`))
  return match ? match[1] : null
}

function writeConsent(value: string): void {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
}

/**
 * Bandeau de consentement cookies. Ne s'affiche que tant que l'utilisateur
 * n'a pas fait de choix (accepter / refuser). Aucun cookie de tracking tiers.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let frame = 0
    frame = requestAnimationFrame(() => {
      if (!readConsent()) {
        setVisible(true)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  function choose(value: "accepted" | "refused") {
    writeConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Préférences de cookies"
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-hairline bg-white p-5 shadow-elevated"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: resolvedTheme === "dark" ? "#1e293b" : "#eef4fe" }}
        >
          <Cookie className="size-5 text-teal-deep" />
        </span>
        <div>
          <p className="mb-1 text-[14px] font-semibold text-ink">
            Nous respectons votre vie privée
          </p>
          <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">
            Laza dépose uniquement des cookies fonctionnels (préférence de consentement, empreinte
            anonyme pour la participation, thème d&apos;affichage) et aucun cookie publicitaire ou de
            tracking tiers. Vous acceptez ou refusez d&apos;emblée.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-md bg-slate-ink px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-teal-mid"
            >
              Tout accepter
            </button>
            <button
              type="button"
              onClick={() => choose("refused")}
              className="rounded-md border border-hairline px-3.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
            >
              Tout refuser
            </button>
            <Link
              href="/cookies"
              className="px-1 py-1.5 text-[13px] font-medium text-teal-deep hover:underline"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}