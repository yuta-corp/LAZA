import { cookies } from "next/headers"
import { LANG_COOKIE, normalizeLang } from "@/lib/i18n"
import { LanguageProvider } from "@/components/language-provider"
import { Footer } from "@/components/footer"
import { LandingHeader } from "@/app/(landing)/landing-header"

/**
 * Layout public de la landing page.
 *
 * La langue est lue dans le cookie côté serveur : la page s'affiche déjà dans
 * la bonne langue au premier rendu, sans clignotement ni requête supplémentaire.
 */
export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value)

  return (
    <LanguageProvider initialLang={lang}>
      <div className="flex min-h-svh flex-col bg-white">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}
