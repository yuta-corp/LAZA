import Link from "next/link"
import Image from "next/image"
import { Megaphone } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export async function Header() {
  const { sessionClaims, userId } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === "admin"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-4">
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

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-muted"
            >
              Modération
            </Link>
          )}
          {userId ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <span className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Connexion
              </span>
            </SignInButton>
          )}
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