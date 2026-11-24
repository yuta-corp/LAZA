import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NavItem } from "@/components/nav-item"
import { getCopy, type Lang } from "@/lib/i18n"

export function Header({ lang = "fr" }: { lang?: Lang }) {
  const t = getCopy(lang)

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.explore, href: "/fil" },
    { label: t.nav.how, href: "/#comment-ca-marche" },
    { label: t.nav.trust, href: "/#confiance" },
    { label: t.nav.press, href: "/brand" },
  ]

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
            <span>{t.feed.report}</span>
          </Link>
        </div>
      </div>

      {/* Navigation secondaire, sur mobile : une rangée qui défile horizontalement. */}
      <nav
        aria-label={t.nav.explore}
        className="-mt-px overflow-x-auto border-t border-hairline px-2"
      >
        <ul className="flex min-w-max items-center gap-1 py-1.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                label={item.label}
                className="px-2.5 py-1.5 text-[13px]"
              />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
