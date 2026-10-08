"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

/**
 * En-tête du parcours de signalement : rien qui détourne de l'action.
 * Le logo ramène à l'accueil, la sortie est explicite, le brouillon est conservé.
 */
export function FocusHeader() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo href="/" size={40} />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-4" />
            {t.form.exit}
          </Link>
        </div>
      </div>
    </header>
  )
}
