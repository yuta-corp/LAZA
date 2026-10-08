"use client"

import { LANGS, LANG_LABELS, LANG_NAMES } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

/** Sélecteur de langue visible (FR / MG), accessible et sans rechargement. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-hairline bg-white p-0.5",
        className,
      )}
    >
      {LANGS.map((value) => {
        const active = value === lang
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLang(value)}
            aria-pressed={active}
            title={LANG_NAMES[value]}
            className={cn(
              "min-h-8 min-w-9 rounded-full px-2.5 text-[12px] font-semibold transition-colors",
              active ? "bg-teal-deep text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            {LANG_LABELS[value]}
          </button>
        )
      })}
    </div>
  )
}
