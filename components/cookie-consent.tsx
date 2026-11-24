"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Cookie } from "lucide-react"
import { dictionaries, LANG_COOKIE, normalizeLang, type Copy } from "@/lib/i18n"

const CONSENT_COOKIE = "laza_cookie_consent"
const ONE_YEAR = 60 * 60 * 24 * 365

function readConsent(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`)
  )
  return match ? match[1] : null
}

function writeConsent(value: string): void {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
}

/**
 * Lit la langue courante depuis le cookie : le bandeau est monté hors du
 * LanguageProvider (il vit à la racine), il ne peut donc pas utiliser le hook.
 */
function readLangCopy(): Copy {
  if (typeof document === "undefined") return dictionaries.fr
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]+)`)
  )
  return dictionaries[
    normalizeLang(match ? decodeURIComponent(match[1]) : undefined)
  ]
}

/**
 * Bandeau de consentement cookies. Ne s'affiche que tant que l'utilisateur
 * n'a pas fait de choix (accepter / refuser). Aucun cookie de tracking tiers.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [t, setT] = useState<Copy>(dictionaries.fr)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let frame = 0
    frame = requestAnimationFrame(() => {
      if (!readConsent()) {
        setT(readLangCopy())
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
      aria-label={t.actions.cookies.ariaLabel}
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-hairline bg-white p-5 shadow-elevated"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: resolvedTheme === "dark" ? "#1e293b" : "#eef4fe",
          }}
        >
          <Cookie className="size-5 text-teal-deep" />
        </span>
        <div>
          <p className="mb-1 text-[14px] font-semibold text-ink">
            {t.actions.cookies.title}
          </p>
          <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">
            {t.actions.cookies.body}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-md bg-slate-ink px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-teal-mid"
            >
              {t.actions.cookies.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("refused")}
              className="rounded-md border border-hairline px-3.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
            >
              {t.actions.cookies.refuse}
            </button>
            <Link
              href="/cookies"
              className="px-1 py-1.5 text-[13px] font-medium text-teal-deep hover:underline"
            >
              {t.actions.cookies.learnMore}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
