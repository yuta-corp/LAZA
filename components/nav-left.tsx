import Link from "next/link"
import { Compass, Home, Megaphone } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getCopy, type Lang } from "@/lib/i18n"

export function NavLeft({ lang = "fr" }: { lang?: Lang }) {
  const t = getCopy(lang).feed
  const navItems = [
    { label: t.navHome, href: "/", icon: Home },
    { label: t.navFeed, href: "/fil#tendances", icon: Compass },
  ]

  return (
    <aside className="sticky top-0 hidden h-svh w-64 flex-col border-r border-hairline bg-white px-4 py-5 md:flex">
      <Logo href="/" size={44} className="w-fit" />

      <nav className="mt-6 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-paper hover:text-teal-deep"
          >
            <Icon className="size-5 shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <Link
        href="/signaler"
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-deep px-4 text-[15px] font-semibold text-white transition-colors hover:bg-teal-mid"
      >
        <Megaphone className="size-4" />
        {t.navReport}
      </Link>

      <div className="mt-auto pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  )
}
