"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/app/actions"
import { ensureShaFingerprint } from "@/lib/fingerprint"

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
      try {
        // L'empreinte (cookie) est la seule source d'identité côté serveur.
        await ensureShaFingerprint()
        const target = !liked
        const result = await toggleLike(slug, target)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        setLiked(result.liked)
        setCount(result.count)
        if (result.liked) setBump(true)
      } catch {
        toast.error("Erreur réseau — réessayez.")
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