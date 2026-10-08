import { cookies } from "next/headers"
import { LANG_COOKIE, normalizeLang } from "@/lib/i18n"
import { LanguageProvider } from "@/components/language-provider"
import { FocusHeader } from "@/app/(focus)/focus-header"

/**
 * Layout du parcours de signalement : une seule chose à faire, aucun menu
 * latéral, aucune distraction. La langue suit le cookie comme sur la landing.
 */
export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value)

  return (
    <LanguageProvider initialLang={lang}>
      <div className="flex min-h-svh flex-col bg-canvas-tint">
        <FocusHeader />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
          <div className="mx-auto w-full max-w-xl">{children}</div>
        </main>
      </div>
    </LanguageProvider>
  )
}
