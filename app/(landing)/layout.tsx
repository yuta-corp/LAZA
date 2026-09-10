import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { MobileMenu } from "@/components/mobile-menu"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Pourquoi LAZA", href: "/#pourquoi-laza" },
  { label: "Modération", href: "/#moderation" },
  { label: "Registre", href: "/#registre" },
]

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[72rem] items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <Logo href="/" size={44} />
            <span className="hidden border-l border-hairline pl-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink sm:inline">
              Civic-Tech
            </span>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/fil"
              className="hidden rounded-md border border-hairline px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-paper sm:inline-flex"
            >
              Explorer
            </Link>
            <Button
              size="sm"
              className="h-9 rounded-md bg-slate-ink px-4 text-on-primary transition-colors hover:bg-teal-mid"
              nativeButton={false}
              render={<Link href="/signaler" />}
            >
              <Megaphone className="size-4" />
              Signaler un fait
            </Button>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}