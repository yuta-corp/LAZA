import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: number
  className?: string
}

export function Logo({ href = "/", size = 28, className }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <Image
        src="/log.png"
        alt="Logo Laza"
        width={size}
        height={size}
        className="rounded-md object-cover"
        priority
      />
      <span className="text-lg font-semibold tracking-tight">Laza</span>
    </Link>
  )
}