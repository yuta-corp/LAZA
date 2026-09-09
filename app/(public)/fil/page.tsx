import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Megaphone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReportCard } from "@/components/report-card"
import { LegalWarning } from "@/components/legal-warning"
import { prisma } from "@/lib/prisma"
import { CATEGORY_LABELS } from "@/lib/report"
import { FINGERPRINT_COOKIE } from "@/lib/constants"
import type { Category } from "@/lib/generated/prisma/enums"

// Le fil reflète immédiatement les signalements publiés par la modération.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Fil des dénonciations vérifiées",
  description:
    "Suivez en temps réel les signalements de corruption vérifiés et publiés à Madagascar. Soutenez-les et participez au fil de commentaires.",
}

interface FeedPageProps {
  searchParams: Promise<{ categorie?: string }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { categorie } = await searchParams
  const filter = categorie && categorie in CATEGORY_LABELS ? (categorie as Category) : undefined

  const cookieStore = await cookies()
  const fingerprint = cookieStore.get(FINGERPRINT_COOKIE)?.value

  const reports = await prisma.report.findMany({
    where: { status: "PUBLISHED", category: filter },
    orderBy: { publishedAt: "desc" },
    include: {
      evidence: true,
      comments: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
    },
    take: 50,
  })

  const likeCounts = await prisma.reportLike.groupBy({
    by: ["reportId"],
    where: { reportId: { in: reports.map((report) => report.id) } },
    _count: { _all: true },
  })
  const likeCountById = new Map(likeCounts.map((row) => [row.reportId, row._count._all]))

  // Empreintes soutenant déjà les signalements affichés (cookie du visiteur)
  let likedReportIds = new Set<string>()
  if (fingerprint) {
    const likes = await prisma.reportLike.findMany({
      where: { fingerprint, report: { status: "PUBLISHED", category: filter } },
      select: { reportId: true },
    })
    likedReportIds = new Set(likes.map((like) => like.reportId))
  }

  return (
    <div>
      {/* En-tête du fil — onglets */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur md:top-0">
        <div className="flex">
          <span className="flex-1 border-b-2 border-accent px-4 py-3 text-center">
            <span className="font-semibold">Tous les signalements</span>
          </span>
        </div>
      </div>

      {/* Zone de contribution */}
      <div className="flex gap-3 border-b border-border px-4 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="pt-1 text-[15px] text-muted-foreground">
            Vous avez connaissance d&apos;un fait de corruption ?
          </p>
          <Button
            size="lg"
            className="w-fit rounded-full"
            nativeButton={false}
            render={<Link href="/signaler" />}
          >
            <Megaphone className="size-4" />
            Signaler un fait
          </Button>
        </div>
      </div>

      {filter && (
        <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">Filtré par :</span>
          <Badge variant="secondary">{CATEGORY_LABELS[filter]}</Badge>
          <Link
            href="/fil"
            className="ml-auto text-sm font-medium text-accent hover:opacity-80"
          >
            Réinitialiser
          </Link>
        </div>
      )}

      {/* Fil chronologique */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <ShieldCheck className="size-10 text-muted-foreground/40" />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Aucun signalement publié pour le moment. Soyez la première voix — chaque
            dénonciation vérifiée alimente la transparence.
          </p>
          <Button variant="outline" className="rounded-full" nativeButton={false} render={<Link href="/signaler" />}>
            Signaler un fait
          </Button>
        </div>
      ) : (
        <div>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              likeCount={likeCountById.get(report.id) ?? 0}
              commentCount={report.comments.length}
              initialLiked={likedReportIds.has(report.id)}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-6">
        <LegalWarning compact />
      </div>
    </div>
  )
}