"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface FeedShareButtonProps {
  title: string
  path: string
}

export function FeedShareButton({ title, path }: FeedShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const url = `${base}${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(`Lien copié — « ${title} » est partageable.`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Impossible de copier le lien.")
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:bg-accent/10 hover:text-accent"
            onClick={copyLink}
          >
            <Share2 className="size-[18px]" />
          </Button>
        }
      />
      <TooltipContent>{copied ? "Lien copié !" : "Partager"}</TooltipContent>
    </Tooltip>
  )
}