import type { Metadata } from "next"
import Link from "next/link"
import { HeartHandshake, Megaphone, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Laza — Dénoncer la corruption à Madagascar",
  description:
    "Plateforme de dénonciation anonyme de corruption à Madagascar. Signalez des faits avec des preuves, vérifiés avant publication.",
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Anonymat par empreinte",
    text: "Seule une empreinte SHA-256 est stockée — jamais votre numéro CIN.",
  },
  {
    icon: Sparkles,
    title: "Preuves vérifiées",
    text: "Chaque signalement est pré-modéré avant d'apparaître publiquement.",
  },
  {
    icon: HeartHandshake,
    title: "Soutenez et discutez",
    text: "Un pseudo vous identifie, pas votre visage ni votre appareil.",
  },
]

export default function LandingPage() {
  return (
    <div className="w-full max-w-2xl py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Dénoncez la corruption.
        <br />
        <span className="text-primary">Sans craindre des représailles.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Laza permet de signaler des faits de corruption à Madagascar avec des preuves.
        Votre identité reste protégée par une empreinte cryptographique.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="h-12 rounded-full px-6 text-base"
          nativeButton={false}
          render={<Link href="/signaler" />}
        >
          <Megaphone className="size-5" />
          Signaler un fait
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full px-6 text-base"
          nativeButton={false}
          render={<Link href="/fil" />}
        >
          Voir les signalements
        </Button>
      </div>

      <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-border bg-secondary/30 p-4">
            <Icon className="size-5 text-primary" />
            <h2 className="mt-2 text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}