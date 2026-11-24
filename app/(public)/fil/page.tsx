import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Megaphone, ShieldCheck } from "lucide-react"
import { ReportCard } from "@/components/report-card"
import { LegalWarning } from "@/components/legal-warning"
import { prisma } from "@/lib/prisma"
import { categoryLabel, getCopy, LANG_COOKIE, normalizeLang } from "@/lib/i18n"
import { CATEGORY_LABELS } from "@/lib/report"
import { FINGERPRINT_COOKIE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/generated/prisma/enums"

// Le fil reflète immédiatement les signalements publiés par la modération.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Registre public des signalements vérifiés",
  description:
    "Suivez les signalements de corruption vérifiés et publiés à Madagascar. Soutenez-les et participez au fil de commentaires.",
}

interface FeedPageProps {
  searchParams: Promise<{ categorie?: string }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { categorie } = await searchParams
  const filter =
    categorie && categorie in CATEGORY_LABELS
      ? (categorie as Category)
      : undefined

  const cookieStore = await cookies()
  const fingerprint = cookieStore.get(FINGERPRINT_COOKIE)?.value
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value)
  const t = getCopy(lang).feed

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

  const likeCountById = new Map(
    likeCounts.map((row) => [row.reportId, row._count._all])
  )
  const totalPublished = categoryCounts.reduce(
    (sum, row) => sum + row._count._all,
    0
  )

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
    <div className="bg-white">
      {/* En-tête du registre : titre, vrai compteur, filtres réels */}
      <div className="sticky top-14 z-30 border-b border-hairline bg-white/90 backdrop-blur md:top-0">
        <div className="px-4 pt-5 sm:px-6">
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-teal-deep uppercase">
            {t.eyebrow}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-newsreader text-[26px] leading-[1.1em] font-medium tracking-[-0.015em] text-ink sm:text-[32px]">
                {t.title}
              </h1>
              <p className="mt-1 text-[14px] text-ink-muted">{t.intro}</p>
            </div>
            <Link
              href="/signaler"
              className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-teal-deep px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-mid sm:inline-flex"
            >
              <Megaphone className="size-4" />
              {t.report}
            </Link>
          </div>

          {/* Filtres par catégorie — onglets soulignés, défilement horizontal mobile */}
          <nav className="-mx-4 mt-4 flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 [-ms-overflow-style:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            <FilterTab
              href="/fil"
              active={!filter}
              label={t.all}
              count={totalPublished}
            />
            {categoryCounts.map((row) => (
              <FilterTab
                key={row.category}
                href={`/fil?categorie=${row.category}`}
                active={filter === row.category}
                label={categoryLabel(lang, row.category)}
                count={row._count._all}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Fil */}
      {reports.length === 0 ? (
        <div className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-sm text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
              <ShieldCheck className="size-6" />
            </span>
            <h2 className="mt-4 font-newsreader text-[22px] font-semibold text-ink">
              {filter ? t.emptyCategoryTitle : t.emptyTitle}
            </h2>
            <p className="mt-2 text-[15px] leading-[1.55em] text-ink-muted">
              {filter ? t.emptyCategoryBody : t.emptyBody}
            </p>
            <div className="mt-5 flex flex-col items-center gap-3">
              <Link
                href="/signaler"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid sm:w-auto"
              >
                <Megaphone className="size-4" />
                {t.report}
              </Link>
              {filter ? (
                <Link
                  href="/fil"
                  className="text-[15px] font-medium text-teal-deep underline-offset-4 hover:underline"
                >
                  {t.seeAll}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              <ReportCard
                report={report}
                likeCount={likeCountById.get(report.id) ?? 0}
                commentCount={report.comments.length}
                initialLiked={likedReportIds.has(report.id)}
                lang={lang}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="px-4 py-8 sm:px-6">
        <LegalWarning compact />
      </div>
    </div>
  )
}

function FilterTab({
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
        "group/tab inline-flex shrink-0 items-center gap-1.5 border-b-2 pt-1 pb-2.5 text-[14px] font-medium transition-colors",
        active
          ? "border-teal-deep text-ink"
          : "border-transparent text-ink-muted hover:border-hairline-strong hover:text-ink"
      )}
    >
      {label}
      <span
        className={cn(
          "font-mono text-[11px] tabular-nums",
          active ? "text-teal-deep" : "text-muted-ink"
        )}
      >
        {count}
      </span>
    </Link>
  )
}
