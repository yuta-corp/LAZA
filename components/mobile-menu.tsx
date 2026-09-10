"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Megaphone, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  links: { label: string; href: string }[]
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  function close() {
    setOpen(false)
  }

  return (
    <div className="relative lg:hidden">
      <Button
        size="icon"
        variant="ghost"
        className="rounded-md text-ink-muted"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute right-0 top-[calc(100%+0.5rem)] flex w-72 flex-col gap-0.5 rounded-lg border border-hairline bg-white p-2 shadow-elevated"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-md px-3 py-2.5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-1.5 border-t border-hairline" />

          <Link
            href="/fil"
            onClick={close}
            className="rounded-md px-3 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-paper"
          >
            Explorer
          </Link>

          <Link
            href="/signaler"
            onClick={close}
            className="mt-1 flex h-9 items-center justify-center gap-2 rounded-md bg-slate-ink px-4 text-sm font-medium text-on-primary transition-colors hover:bg-teal-mid"
          >
            <Megaphone className="size-4" />
            Signaler un fait
          </Link>
        </nav>
      )}
    </div>
  )
}