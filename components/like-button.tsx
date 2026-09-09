"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const COOKIE_NAME = "laza_fp"

function getFingerprint(): string {
  const match = document.cookie.match(/(?:^|; )laza_fp=([^;]+)/)
  if (match) return match[1]
  const fp = crypto.randomUUID()
  document.cookie = `${COOKIE_NAME}=${fp}; path=/; max-age=31536000; SameSite=Lax`
  return fp
}

interface LikeButtonProps {
  slug: string
  initialCount: number
  initialLiked: boolean
}

export function LikeButton({ slug, initialCount, initialLiked }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [pending, startTransition] = useTransition()
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (bump) {
      const t = setTimeout(() => setBump(false), 200)
      return () => clearTimeout(t)
    }
  }, [bump])

  const toggle = useCallback(() => {
    if (pending) return
    startTransition(async () => {
      const fingerprint = getFingerprint()
      try {
        const res = await fetch(`/api/reports/${slug}/like`, {
          method: liked ? "DELETE" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint }),
        })
        if (!res.ok) return
        const data = (await res.json()) as { liked: boolean; count: number }
        setLiked(data.liked)
        setCount(data.count)
        if (data.liked) setBump(true)
      } catch {
        // erreur réseau — on garde l'état actuel
      }
    })
  }, [liked, pending, slug])

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Retirer mon soutien" : "Soutenir ce signalement"}
      className={cn(
        "group flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        liked ? "text-accent" : "hover:bg-accent/10 hover:text-accent"
      )}
    >
      <Heart
        className={cn(
          "size-[18px] transition-transform duration-200",
          bump && "scale-125",
          liked && "fill-current"
        )}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  )
}