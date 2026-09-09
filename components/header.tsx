import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-4">
        <Logo href="/" />

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button size="sm" className="rounded-full" nativeButton={false} render={<Link href="/signaler" />}>
            <Megaphone className="size-3.5" />
            <span className="hidden sm:inline">Signaler</span>
          </Button>
        </div>
      </div>
    </header>
  )
}