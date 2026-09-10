"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Orchestrateur d'animations de la landing LAZA.
 * - [data-hero] : apparition du hero au chargement (stagger).
 * - [data-reveal] : révélation des enfants (cartes / grilles) au scroll.
 * - [data-fade] : fondu simple des blocs de texte au scroll.
 * Respecte prefers-reduced-motion ; se nettoie au démontage.
 */
export function LandingReveal({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      const hero = root.querySelectorAll<HTMLElement>("[data-hero]")
      if (hero.length) {
        gsap.fromTo(
          hero,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power2.out", clearProps: "transform" },
        )
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((trigger) => {
        gsap.fromTo(
          trigger.children,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            clearProps: "transform",
            scrollTrigger: { trigger, start: "top 86%", once: true },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((trigger) => {
        gsap.fromTo(
          trigger,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "transform",
            scrollTrigger: { trigger, start: "top 90%", once: true },
          },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  )
}