"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

/**
 * En-tête de la landing page : pas de menu chargé, une seule action possible.
 * Le sélecteur de langue reste visible en permanence.
 */
export function LandingHeader() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[72rem] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <Logo href="/" size={46} />

        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label={t.nav.explore}
        >
          <Link
            href="/fil"
            className="rounded-lg px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-teal-deep"
          >
            {t.nav.explore}
          </Link>
          <Link
            href="/#comment-ca-marche"
            className="rounded-lg px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-teal-deep"
          >
            {t.nav.how}
          </Link>
          <Link
            href="/#confiance"
            className="rounded-lg px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-teal-deep"
          >
            {t.nav.trust}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/signaler"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-teal-deep px-3 text-[13px] font-semibold text-white transition-colors hover:bg-teal-mid sm:px-4 sm:text-[14px]"
          >
            {t.header.cta}
            <ArrowRight className="hidden size-4 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  )
}
