import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: number
  className?: string
}

/**
 * Monogramme LAZA (marque issue du design Stitch) : pavé charcoal avec
 * tic teal « vibratoire » + point d'orgue accent. Le mot est rendu en
 * typographie serif (Newsreader) pour l'identité éditoriale.
 */
export function Logo({ href = "/", size = 32, className }: LogoProps) {
  const mark = size
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        width={mark}
        height={mark}
        aria-hidden="true"
        className="shrink-0 rounded-md"
      >
        <rect width="32" height="32" rx="4" fill="#12181F" />
        <path
          d="M7 16L13 22L25 10"
          stroke="#0C95AB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="21" cy="21" r="2.5" fill="#0C95AB" />
      </svg>
      <span className="font-newsreader text-lg font-semibold tracking-tight">Laza</span>
    </Link>
  )
}