"use client"

import { useState } from "react"
import { Link2, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  FacebookBrandIcon,
  InstagramBrandIcon,
  LinkedinBrandIcon,
  WhatsappBrandIcon,
  XBrandIcon,
} from "@/components/brand-icons"

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
}

interface ShareButtonsProps {
  title: string
  /** Chemin absolu, ex. /signalement/mon-slug */
  path: string
}

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const url = `${getBaseUrl()}${path}`
  const text = `${title} — signalement vérifié sur Laza`

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  const links = [
    {
      label: "Partager sur X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: XBrandIcon,
    },
    {
      label: "Partager sur LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedinBrandIcon,
    },
    {
      label: "Partager sur Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookBrandIcon,
    },
    {
      label: "Partager sur WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: WhatsappBrandIcon,
    },
  ]

  async function copyLink(message?: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(message ?? "Lien copié dans le presse-papier.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Impossible de copier le lien.")
    }
  }

  async function nativeShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // partage annulé par l'utilisateur
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {links.map(({ label, href, icon: Icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground"
                nativeButton={false}
                render={<a href={href} target="_blank" rel="noopener noreferrer" />}
              >
                <Icon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => copyLink()}
            >
              <Link2 className="size-4" />
            </Button>
          }
        />
        <TooltipContent>{copied ? "Copié !" : "Copier le lien"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={nativeShare}>
              <Share2 className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Partager</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => copyLink("Lien copié — collez-le dans votre story Instagram.")}
            >
              <InstagramBrandIcon className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Story Instagram (copie le lien)</TooltipContent>
      </Tooltip>
    </div>
  )
}