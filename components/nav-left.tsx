import Link from "next/link"
import { Compass, Home, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const NAV_ITEMS = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Explorer", href: "/fil#tendances", icon: Compass },
]

export function NavLeft() {
  return (
    <aside className="sticky top-0 hidden h-svh w-72 flex-col px-3 py-4 md:flex">
      <div className="flex flex-col gap-1">
        <Logo href="/" size={40} className="w-fit rounded-lg p-2.5 transition-colors hover:bg-muted" />

        <nav className="mt-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Icon className="size-6 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}

          <Button
            size="lg"
            className="mt-4 h-11 w-full rounded-full text-[15px]"
            nativeButton={false}
            render={<Link href="/signaler" />}
          >
            <Megaphone className="size-5" />
            <span className="hidden lg:inline">Signaler</span>
          </Button>
        </nav>
      </div>
    </aside>
  )
}