"use client"

import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

const CONTACT_EMAIL = "yttuta-mg@proton.me"

/**
 * Pied de page de la landing : volontairement minimal (guide landing page).
 * Il répète l'action principale, garde le contact réel et la mention légale
 * essentielle, sans plan du site ni distractions.
 */
export function Footer() {
  const { t } = useLanguage()

  const links = [
    { label: t.footer.links.how, href: "/#comment-ca-marche" },
    { label: t.footer.links.feed, href: "/fil" },
    { label: t.footer.links.legal, href: "/legal" },
    { label: t.footer.links.terms, href: "/terms" },
    { label: t.footer.links.cookies, href: "/cookies" },
  ]

  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto max-w-[72rem] px-5 py-12 lg:px-6">
        {/* CTA répété en bas de page */}
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-hairline bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-newsreader text-[22px] font-semibold text-ink">{t.finalCta.title}</p>
            <p className="mt-1 text-[15px] text-ink-muted">{t.finalCta.note}</p>
          </div>
          <Link
            href="/signaler"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid sm:w-auto"
          >
            {t.finalCta.cta}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Logo href="/" size={36} />
            <p className="mt-3 text-[15px] leading-[1.55em] text-ink-muted">{t.footer.tagline}</p>
          </div>

          <div className="flex flex-col gap-2">
            <LanguageSwitcher className="w-fit" />
            <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[14px] text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {t.footer.links.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-hairline pt-6">
          <p className="flex items-start gap-2 text-[14px] leading-[1.55em] text-ink-muted">
            <Lock className="mt-0.5 size-4 shrink-0 text-secure" />
            <span>{t.footer.legalShort}</span>
          </p>
          <p className="mt-3 text-[13px] text-muted-ink">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
