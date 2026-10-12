import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getCopy, type Lang } from "@/lib/i18n"

export function Header({ lang = "fr" }: { lang?: Lang }) {
  const t = getCopy(lang).feed

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 items-center justify-between gap-2 px-4">
        <Logo href="/" size={40} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/signaler"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-teal-deep px-3 text-[14px] font-semibold text-white transition-colors hover:bg-teal-mid"
          >
            <Megaphone className="size-4" />
            <span>{t.report}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
