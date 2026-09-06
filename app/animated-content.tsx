'use client';

import { useEffect, useRef } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Fingerprint, Megaphone, ShieldCheck } from "lucide-react"
import { LegalWarning } from "@/components/legal-warning"
import { ReportCard } from "@/components/report-card"
import type { Evidence, Report } from "@/lib/generated/prisma/client"

interface AnimatedContentProps {
  reports: Array<Report & { evidence: Evidence[] }>
}

export default function AnimatedContent({ reports }: AnimatedContentProps) {
  const gsapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Import GSAP dynamically to avoid SSR issues
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const container = gsapContainerRef.current;
      if (!container) return;

      // Logo animation
      const logoImg = container.querySelector(".w-24.h-24 img");
      if (logoImg) {
        gsap.fromTo(
          logoImg,
          { scale: 0.8, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      // Heading animation
      const heading = container.querySelector("h1.font-heading");
      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.5,
          }
        );
      }

      // Subheading animation
      const subheading = container.querySelector("p.max-w-2xl");
      if (subheading) {
        gsap.fromTo(
          subheading,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.8,
          }
        );
      }

      // Buttons animation
      const buttonsContainer = container.querySelector(".flex.flex-col.gap-4");
      if (buttonsContainer) {
        gsap.fromTo(
          buttonsContainer,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 1.0,
          }
        );
      }

      // Legal warning animation
      const legalWarning = container.querySelector(".my-12");
      if (legalWarning) {
        gsap.fromTo(
          legalWarning,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 1.2,
          }
        );
      }

      // How it works section
      const howItWorksTitle = container.querySelector("#comment-ca-marche h2");
      if (howItWorksTitle) {
        gsap.fromTo(
          howItWorksTitle,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 1.4,
          }
        );
      }

      const howItWorksSteps = container.querySelectorAll("#comment-ca-marche .flex.flex-col");
      howItWorksSteps.forEach((step, index) => {
        gsap.fromTo(
          step as HTMLElement,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 1.6 + index * 0.2,
          }
        );
      });

      // Recent reports section
      const reportsTitle = container.querySelector("#dernieres-denonciations h2");
      if (reportsTitle) {
        gsap.fromTo(
          reportsTitle,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 2.2,
          }
        );
      }

      const reportCards = container.querySelectorAll("#dernieres-denonciations .bg-card");
      reportCards.forEach((card, index) => {
        gsap.fromTo(
          card as HTMLElement,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: 2.4 + index * 0.1,
          }
        );
      });

      // Footer animation
      const footer = container.querySelector("footer");
      if (footer) {
        gsap.fromTo(
          footer,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 3.0,
          }
        );
      }

      // Scroll-triggered animations for reports
      reportCards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 80%",
          toggleClass: { className: "animate-in", targets: card },
        });
      });
    };

    const container = gsapContainerRef.current;
    loadGSAP();

    return () => {
      // Cleanup GSAP contexts if needed
      if (window.gsap && container) {
        window.gsap.killTweensOf(container);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* GSAP Animations Container */}
      <div ref={gsapContainerRef} className="pointer-events-none">
        {/* Page Content */}
        <header className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-8 text-center">
              {/* Enhanced Logo with Animation */}
              <div className="relative w-24 h-24">
                <Image
                  src="/log.png"
                  alt="Logo Laza"
                  width={120}
                  height={120}
                  className="w-full h-full object-contain drop-shadow-lg"
                  priority
                />
                {/* Optional decorative element */}
                <div className="absolute inset-0 rounded-full border-2 border-accent/20"></div>
              </div>

              {/* Heading with better typography */}
              <h1 className="font-heading text-4xl font-bold tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                La corruption ne prospère plus dans l&apos;ombre
              </h1>

              {/* Subheading */}
              <p className="max-w-2xl text-lg text-muted-foreground">
                Laza permet de dénoncer la corruption à Madagascar, <strong className="font-semibold">anonymement</strong> et{" "}
                <strong className="font-semibold">avec des preuves</strong>. Chaque signalement est vérifié par une équipe de
                modération avant publication — puis partageable sur X, Facebook, LinkedIn ou
                WhatsApp.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/signaler" className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-primary/20">
                  <Megaphone className="size-5" />
                  Signaler un fait de corruption
                </Link>

                <a href="#dernieres-denonciations" className="flex items-center justify-center gap-3 px-8 py-4 border border-primary text-primary hover:bg-primary/50 hover:text-primary-foreground font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
                  Voir les dernières dénonciations
                  <ArrowRight className="size-5" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Legal Warning with container for animation */}
        <div className="my-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LegalWarning />
        </div>

        {/* How it works section */}
        <section id="comment-ca-marche" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
              Comment ça marche ?
            </h2>

            <div className="grid gap-8 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition_all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Megaphone className="size-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  1. Vous signalez
                </h3>
                <p className="text-center text-muted-foreground max-w-xl">
                  Décrivez les faits et joignez des preuves. Votre identité est protégée par une
                  empreinte cryptographique calculée sur votre appareil.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition_all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="size-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  2. La modération vérifie
                </h3>
                <p className="text-center text-muted-foreground max-w-xl">
                  Une équipe indépendante examine les preuves et recoupe les faits avant toute
                  publication. Les signalements non étayés sont rejetés.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:transition_all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Fingerprint className="size-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  3. Vous partagez
                </h3>
                <p className="text-center text-muted-foreground max-w-xl">
                  Une fois publié, le signalement devient une carte partageable sur les réseaux
                  sociaux pour amplifier la pression citoyenne.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent reports section */}
        <section id="dernieres-denonciations" className="py-16 bg-muted/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Dernières dénonciations vérifiées
              </h2>
              <Link href="/signaler" className="flex items-center gap-3 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-lg transition_all duration-200">
                Signaler un fait
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Aucun signalement publié pour le moment. Soyez le premier à signaler un fait.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-card rounded-xl border border-border/50 shadow-sm hover:transition_all duration-300 transform hover:-translate-y-1">
                    <ReportCard report={report} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 text-center border-t border-border/20 pt-8">
              <p className="text-muted-foreground">
                © {new Date().getFullYear()} Laza - Tous droits réservés
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Mentions légales
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Politique de confidentialité
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Conditions d&apos;utilisation
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}