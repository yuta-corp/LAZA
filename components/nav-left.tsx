import Link from "next/link"
import Image from "next/image"
import { Compass, Home, Megaphone, ShieldCheck } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Explorer", href: "/#tendances", icon: Compass },
]

export async function NavLeft() {
  const { sessionClaims, userId } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === "admin"

  return (
    <aside className="sticky top-0 hidden h-svh w-72 flex-col px-3 py-4 md:flex">
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 rounded-lg p-2.5 transition-colors hover:bg-muted"
        >
          <Image
            src="/log.png"
            alt="Logo Laza"
            width={32}
            height={32}
            className="size-8 rounded-lg object-cover"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Laza</span>
        </Link>

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
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ShieldCheck className="size-6 shrink-0" />
              <span className="hidden lg:inline">Modération</span>
            </Link>
          )}

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

      <div className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5">
        <ThemeToggle />
        <div className="ml-auto flex items-center gap-2">
          {userId ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="hidden lg:inline-flex">
                Connexion
              </Button>
            </SignInButton>
          )}
        </div>
      </div>

      <span className={cn("sr-only")}>Navigation principale</span>
    </aside>
  )
}