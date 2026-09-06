import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  MapPin,
  Mic,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShareButtons } from "@/components/share-buttons"
import { LegalWarning } from "@/components/legal-warning"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, formatDateFr } from "@/lib/report"
import { prisma } from "@/lib/prisma"
import { EvidenceKind } from "@/lib/generated/prisma/enums"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface MetadataProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params
  const report = await prisma.report.findUnique({ where: { slug } })

  if (!report || report.status !== "PUBLISHED") {
    return { title: "Signalement non trouvé" }
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/signalement/${slug}`
  return {
    title: report.title,
    description: report.summary,
    openGraph: {
      title: `${report.title} — Laza`,
      description: report.summary,
      url,
      type: "article",
      images: [{ url: "/log.png", width: 2000, height: 2000, alt: "Laza" }],
    },
    twitter: {
      card: "summary_large_image",
      title: report.title,
      description: report.summary,
      images: ["/log.png"],
    },
  }
}

const EVIDENCE_ICONS: Record<EvidenceKind, typeof FileText> = {
  [EvidenceKind.DOCUMENT]: FileText,
  [EvidenceKind.IMAGE]: ImageIcon,
  [EvidenceKind.VIDEO]: Film,
  [EvidenceKind.AUDIO]: Mic,
  [EvidenceKind.LINK]: Link2,
}

const EVIDENCE_LABELS: Record<EvidenceKind, string> = {
  [EvidenceKind.DOCUMENT]: "Document",
  [EvidenceKind.IMAGE]: "Image",
  [EvidenceKind.VIDEO]: "Vidéo",
  [EvidenceKind.AUDIO]: "Audio",
  [EvidenceKind.LINK]: "Lien",
}

export default async function SignalementPage({ params }: PageProps) {
  const { slug } = await params
  const report = await prisma.report.findUnique({
    where: { slug },
    include: { evidence: true },
  })

  if (!report || report.status !== "PUBLISHED") {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
        <ArrowLeft className="size-4" />
        Retour à l&apos;accueil
      </Button>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-medium">Dénonciateur anonyme</span>
              <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{formatDateFr(report.publishedAt ?? report.createdAt)}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className={CATEGORY_VARIANTS[report.category]}>
                {CATEGORY_LABELS[report.category]}
              </Badge>
              {report.region && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {report.region}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-tight">{report.title}</h1>
            <p className="mt-2 text-muted-foreground">{report.summary}</p>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
          {report.description}
        </div>

        <Separator className="my-5" />

        <div>
          <h2 className="text-sm font-semibold">
            Preuves fournies ({report.evidence.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {report.evidence.map((evidence) => {
              const Icon = EVIDENCE_ICONS[evidence.kind]
              const label = EVIDENCE_LABELS[evidence.kind]
              return (
                <li key={evidence.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{evidence.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {label}
                      {evidence.verificationStatus === "VERIFIED" && " · vérifiée"}
                    </p>
                  </div>
                  {evidence.url && (
                    <a
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Link2 className="size-3" />
                      {evidence.kind === EvidenceKind.LINK ? "Ouvrir la source" : "Consulter la preuve"}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              Vérifié &amp; publié
            </span>
            <span className="font-mono text-xs text-muted-foreground">{report.reference}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Partager :</span>
            <ShareButtons title={report.title} path={`/signalement/${report.slug}`} />
          </div>
        </div>
      </Card>

      <LegalWarning compact />

      <div className="rounded-lg border border-dashed p-5 text-center">
        <h3 className="font-semibold">Vous avez des informations complémentaires ?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Signalez un fait lié à ce dossier — la modération recoupera les éléments.
        </p>
        <Button className="mt-3" nativeButton={false} render={<Link href="/signaler" />}>
          Signaler un fait
        </Button>
      </div>
    </div>
  )
}