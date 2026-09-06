"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionOrchestratorProps {
  children: React.ReactNode;
}

function SectionOrchestrator({ children }: SectionOrchestratorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealSelectors = [
      ".laza-hero-section",
      ".laza-how-section",
      ".laza-reports-section",
      ".laza-footer-section",
    ].filter(Boolean) as string[];

    const items = root.querySelectorAll<HTMLElement>(
      revealSelectors.join(", ")
    );

    if (items.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".laza-hero-logo",
        { scale: 0.9, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "sine.out",
          delay: 0.2,
        }
      );

      gsap.fromTo(
        ".laza-hero-eyebrow",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "sine.out",
          delay: 0.5,
        }
      );

      gsap.fromTo(
        ".laza-hero-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "sine.out",
          delay: 0.8,
        }
      );

      gsap.fromTo(
        ".laza-hero-sub",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "sine.out",
          delay: 1.0,
        }
      );

      gsap.fromTo(
        ".laza-hero-actions",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "sine.out",
          delay: 1.2,
        }
      );

      const stepWords = gsap.utils.toArray<HTMLElement>(".laza-step-word");
      const stepIcons = gsap.utils.toArray<HTMLElement>(".laza-step-icon");
      const stepCards = gsap.utils.toArray<HTMLElement>(".laza-step");

      if (stepWords.length) {
        gsap.fromTo(
          stepWords,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "sine.out",
            delay: 0.2,
          }
        );
      }

      if (stepIcons.length) {
        gsap.fromTo(
          stepIcons,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)",
            delay: 0.3,
          }
        );
      }

      if (stepCards.length) {
        gsap.fromTo(
          stepCards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "sine.out",
            delay: 0.6,
          }
        );
      }

      const reportCards = gsap.utils.toArray<HTMLElement>(".laza-report");

      if (reportCards.length) {
        gsap.fromTo(
          reportCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "sine.out",
            delay: 0.4,
          }
        );
      }

      ScrollTrigger.create({
        trigger: ".laza-how-section",
        start: "top 86%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".laza-how-section",
            { opacity: 0.2, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "sine.out",
            }
          );
        },
      });

      ScrollTrigger.create({
        trigger: ".laza-reports-section",
        start: "top 86%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".laza-reports-section",
            { opacity: 0.2, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "sine.out",
            }
          );
        },
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {children}
    </div>
  );
}

export { SectionOrchestrator };
