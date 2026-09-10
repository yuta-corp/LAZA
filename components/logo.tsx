import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: number
  className?: string
}

/**
 * Logotype officiel LAZA (emblem vectoriel, fichier public/logo.svg).
 * Utilisé tel quel sur les surfaces claires du site public.
 */
export function Logo({ href = "/", size = 44, className }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center", className)}>
      <Image
        src="/logo.svg"
        alt="Laza"
        width={size}
        height={size}
        unoptimized
        priority
        style={{ width: size, height: size }}
        className="shrink-0 object-contain"
      />
    </Link>
  )
}