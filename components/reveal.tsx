"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  className?: string
  /** Délai en secondes, pour les entrées en cascade. */
  delay?: number
  /** Décalage vertical de départ en pixels. */
  y?: number
}

interface TweenHandle {
  kill: () => void
  scrollTrigger?: { kill: () => void }
}

/**
 * Révélation au scroll, discrète et non bloquante.
 *
 * Le contenu est rendu normalement (visible, indexable) ; l'animation GSAP
 * n'est chargée qu'au montage, sur le client, et uniquement si la personne
 * n'a pas demandé de mouvement réduit. Sans JavaScript, tout reste lisible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let cancelled = false
    let tween: TweenHandle | undefined

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (cancelled || !ref.current) return
      gsap.registerPlugin(ScrollTrigger)
      tween = gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      ) as unknown as TweenHandle
    })()

    return () => {
      cancelled = true
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [delay, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
