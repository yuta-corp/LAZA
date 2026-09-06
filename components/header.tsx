import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/log.png"
            alt="Logo Laza"
            width={28}
            height={28}
            className="size-7 rounded-md object-cover"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Laza</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            Accueil
          </Link>
          <Link href="/#comment-ca-marche" className="hidden rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground sm:block">
            Comment ça marche
          </Link>
          <ThemeToggle />
          <Button size="sm" className="ml-1" nativeButton={false} render={<Link href="/signaler" />}>
            Signaler
          </Button>
        </nav>
      </div>
    </header>
  )
}