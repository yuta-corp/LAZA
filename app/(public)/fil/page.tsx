import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Megaphone, ShieldCheck } from "lucide-react"
import { ReportCard } from "@/components/report-card"
import { LegalWarning } from "@/components/legal-warning"
import { prisma } from "@/lib/prisma"
import { CATEGORY_LABELS } from "@/lib/report"
import { FINGERPRINT_COOKIE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/generated/prisma/enums"

// Le fil reflète immédiatement les signalements publiés par la modération.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Fil des dénonciations vérifiées",
  description:
    "Suivez les signalements de corruption vérifiés et publiés à Madagascar. Soutenez-les et participez au fil de commentaires.",
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

  const [likeCounts, categoryCounts] = await Promise.all([
    prisma.reportLike.groupBy({
      by: ["reportId"],
      where: { reportId: { in: reports.map((report) => report.id) } },
      _count: { _all: true },
    }),
    // Puces de filtre : uniquement les catégories qui ont du contenu publié.
    prisma.report.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
    }),
  ])

  const likeCountById = new Map(likeCounts.map((row) => [row.reportId, row._count._all]))
  const totalPublished = categoryCounts.reduce((sum, row) => sum + row._count._all, 0)

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
    <div className="min-h-svh bg-canvas-tint">
      {/* En-tête du fil : titre, vrai compteur, filtres réels */}
      <div className="sticky top-14 z-30 border-b border-hairline bg-white/90 backdrop-blur md:top-0">
        <div className="px-4 pt-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-newsreader text-[22px] font-semibold leading-tight text-ink sm:text-[26px]">
                Signalements publiés
              </h1>
              <p className="mt-0.5 text-[14px] text-ink-muted">
                Des faits vérifiés, publiés sans le nom des personnes.
              </p>
            </div>
            <Link
              href="/signaler"
              className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-teal-deep px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-mid sm:inline-flex"
            >
              <Megaphone className="size-4" />
              Signaler un fait
            </Link>
          </div>

          {/* Filtres par catégorie — vraies puces, défilement horizontal sur mobile */}
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip href="/fil" active={!filter} label="Tout" count={totalPublished} />
            {categoryCounts.map((row) => (
              <FilterChip
                key={row.category}
                href={`/fil?categorie=${row.category}`}
                active={filter === row.category}
                label={CATEGORY_LABELS[row.category]}
                count={row._count._all}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fil */}
      {reports.length === 0 ? (
        <div className="px-4 py-12 sm:px-5">
          <div className="mx-auto max-w-md rounded-2xl border border-hairline bg-white p-6 text-center sm:p-8">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-deep/10 text-teal-deep">
              <ShieldCheck className="size-6" />
            </span>
            <h2 className="mt-4 font-newsreader text-[22px] font-semibold text-ink">
              {filter ? "Rien dans cette catégorie" : "Rien à afficher pour l'instant"}
            </h2>
            <p className="mt-2 text-[15px] leading-[1.55em] text-ink-muted">
              {filter
                ? "Aucun fait vérifié n'a encore été publié dans cette catégorie."
                : "Les premiers signalements vérifiés apparaîtront ici. Tu peux être la première personne à en déposer un."}
            </p>
            <div className="mt-5 flex flex-col items-center gap-2">
              <Link
                href="/signaler"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid sm:w-auto"
              >
                <Megaphone className="size-4" />
                Signaler un fait
              </Link>
              {filter ? (
                <Link
                  href="/fil"
                  className="text-[15px] font-medium text-teal-deep underline-offset-4 hover:underline"
                >
                  Voir tous les signalements
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <ul className="space-y-4 px-4 py-5 sm:px-5">
          {reports.map((report) => (
            <li key={report.id}>
              <ReportCard
                report={report}
                likeCount={likeCountById.get(report.id) ?? 0}
                commentCount={report.comments.length}
                initialLiked={likedReportIds.has(report.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="px-4 pb-10 sm:px-5">
        <LegalWarning compact />
      </div>
    </div>
  )
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count: number
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-teal-deep bg-teal-deep text-white"
          : "border-hairline bg-white text-ink-muted hover:border-teal-deep/40 hover:text-ink",
      )}
    >
      {label}
      <span className={cn("tabular-nums", active ? "text-white/75" : "text-muted-ink")}>{count}</span>
    </Link>
  )
}
