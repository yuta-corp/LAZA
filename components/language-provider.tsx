"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_LANG, LANG_COOKIE, dictionaries, type Copy, type Lang } from "@/lib/i18n"

interface LanguageValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Copy
}

/**
 * Langue par défaut hors provider : les pages qui n'affichent pas de
 * sélecteur de langue continuent de fonctionner en français.
 */
const FALLBACK: LanguageValue = {
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: dictionaries[DEFAULT_LANG],
}

const LanguageContext = createContext<LanguageValue>(FALLBACK)

/**
 * Fournit la langue courante à toute la page.
 *
 * `initialLang` vient du cookie lu côté serveur : le premier rendu est donc
 * déjà dans la bonne langue (aucun clignotement) et changer de langue est
 * instantané, sans rechargement ni requête réseau.
 */
export function LanguageProvider({
  initialLang = DEFAULT_LANG,
  children,
}: {
  initialLang?: Lang
  children: React.ReactNode
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
      window.localStorage.setItem(LANG_COOKIE, next)
    } catch {
      // Cookie/localStorage indisponibles (mode privé) : la langue reste
      // active pour la session en cours, sans persistance.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<LanguageValue>(
    () => ({ lang, setLang, t: dictionaries[lang] }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  return useContext(LanguageContext)
}
