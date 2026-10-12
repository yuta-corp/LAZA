"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  label: string
  icon?: ReactNode
  className?: string
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  if (href.startsWith("/#")) return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Lien de navigation avec état actif calculé depuis la route courante. */
export function NavItem({ href, label, icon, className }: NavItemProps) {
  const pathname = usePathname()
  const active = isActive(pathname, href)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink transition-colors",
        active
          ? "bg-teal-deep/10 text-teal-deep"
          : "hover:bg-paper hover:text-teal-deep",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
