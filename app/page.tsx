import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Fingerprint, Megaphone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LegalWarning } from "@/components/legal-warning"
import { ReportCard } from "@/components/report-card"
import { prisma } from "@/lib/prisma"

// Le fil doit refléter immédiatement les signalements publiés par la modération.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const reports = await prisma.report.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { evidence: true },
    take: 20,
  })

  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center gap-6 pt-8 text-center sm:pt-14">
        <Image
          src="/log.png"
          alt="Logo Laza"
          width={96}
          height={96}
          className="size-20 rounded-2xl sm:size-24"
        />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            La corruption ne prospère plus dans l&apos;ombre
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
            Laza permet de dénoncer la corruption à Madagascar, <strong>anonymement</strong> et{" "}
            <strong>avec des preuves</strong>. Chaque signalement est vérifié par une équipe de
            modération avant publication — puis partageable sur X, Facebook, LinkedIn ou
            WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/signaler" />}>
            <Megaphone className="size-4" />
            Signaler un fait de corruption
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<a href="#dernieres-denonciations" />}>
            Voir les dernières dénonciations
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <LegalWarning />

      <section id="comment-ca-marche" className="scroll-mt-20">
        <h2 className="text-xl font-semibold">Comment ça marche ?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <Megaphone className="size-5 text-primary" />
            <h3 className="mt-2 font-medium">1. Vous signalez</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Décrivez les faits et joignez des preuves. Votre identité est protégée par une
              empreinte cryptographique calculée sur votre appareil.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="mt-2 font-medium">2. La modération vérifie</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Une équipe indépendante examine les preuves et recoupe les faits avant toute
              publication. Les signalements non étayés sont rejetés.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <Fingerprint className="size-5 text-primary" />
            <h3 className="mt-2 font-medium">3. Vous partagez</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Une fois publié, le signalement devient une carte partageable sur les réseaux
              sociaux pour amplifier la pression citoyenne.
            </p>
          </div>
        </div>
      </section>

      <section id="dernieres-denonciations" className="scroll-mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dernières dénonciations vérifiées</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/signaler" />}>
            Signaler un fait
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {reports.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aucun signalement publié pour le moment. Soyez le premier à signaler un fait.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}