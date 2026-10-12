import Link from "next/link"
import {
  Compass,
  HelpCircle,
  Home,
  Megaphone,
  Newspaper,
  ShieldCheck,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NavItem } from "@/components/nav-item"
import { getCopy, type Lang } from "@/lib/i18n"

export function NavLeft({ lang = "fr" }: { lang?: Lang }) {
  const t = getCopy(lang)

  const navItems = [
    {
      label: t.nav.home,
      href: "/",
      icon: <Home className="size-5 shrink-0" />,
    },
    {
      label: t.nav.explore,
      href: "/fil",
      icon: <Compass className="size-5 shrink-0" />,
    },
    {
      label: t.nav.how,
      href: "/#comment-ca-marche",
      icon: <HelpCircle className="size-5 shrink-0" />,
    },
    {
      label: t.nav.trust,
      href: "/#confiance",
      icon: <ShieldCheck className="size-5 shrink-0" />,
    },
    {
      label: t.nav.press,
      href: "/brand",
      icon: <Newspaper className="size-5 shrink-0" />,
    },
  ]

  return (
    <aside className="sticky top-0 hidden h-svh w-64 flex-col border-r border-hairline bg-white px-4 py-5 md:flex">
      <Logo href="/" size={44} className="w-fit" />

      <nav className="mt-6 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      <Link
        href="/signaler"
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-deep px-4 text-[15px] font-semibold text-white transition-colors hover:bg-teal-mid"
      >
        <Megaphone className="size-4" />
        {t.feed.navReport}
      </Link>

      <div className="mt-auto pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  )
}
