"use client"

import { useState } from "react"
import { Link2, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from "@/components/language-provider"
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
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const url = `${getBaseUrl()}${path}`
  const text = t.actions.share.text(title)

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  const links = [
    {
      label: t.actions.share.onX,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: XBrandIcon,
    },
    {
      label: t.actions.share.onLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedinBrandIcon,
    },
    {
      label: t.actions.share.onFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookBrandIcon,
    },
    {
      label: t.actions.share.onWhatsapp,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: WhatsappBrandIcon,
    },
  ]

  async function copyLink(message?: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(message ?? t.actions.share.copiedToast)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t.actions.share.copyFailed)
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
                render={
                  <a href={href} target="_blank" rel="noopener noreferrer" />
                }
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
        <TooltipContent>
          {copied ? t.actions.share.copied : t.actions.share.copyLink}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground"
              onClick={nativeShare}
            >
              <Share2 className="size-4" />
            </Button>
          }
        />
        <TooltipContent>{t.actions.share.share}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => copyLink(t.actions.share.storyCopied)}
            >
              <InstagramBrandIcon className="size-4" />
            </Button>
          }
        />
        <TooltipContent>{t.actions.share.storyLabel}</TooltipContent>
      </Tooltip>
    </div>
  )
}
