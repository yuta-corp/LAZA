import { cookies } from "next/headers"
import { NavLeft } from "@/components/nav-left"
import { TrendsPanel } from "@/components/trends-panel"
import { Header } from "@/components/header"
import { LanguageProvider } from "@/components/language-provider"
import { LANG_COOKIE, normalizeLang } from "@/lib/i18n"

/**
 * Layout du registre public (fil, dossiers).
 *
 * La langue est lue côté serveur depuis le cookie : le premier rendu est déjà
 * dans la bonne langue, et les composants clients partagent le même contexte.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value)

  return (
    <LanguageProvider initialLang={lang}>
      {/* Barre supérieure, visible uniquement sur mobile */}
      <div className="md:hidden">
        <Header lang={lang} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Sidebar gauche — navigation (desktop) */}
        <NavLeft lang={lang} />

        {/* Colonne centrale — registre */}
        <main className="min-w-0 flex-1 border-x border-hairline bg-white md:max-w-2xl lg:max-w-[640px]">
          {children}
        </main>

        {/* Sidebar droite — tendances (grands écrans) */}
        <TrendsPanel lang={lang} />
      </div>
    </LanguageProvider>
  )
}
