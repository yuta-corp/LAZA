import Link from "next/link"
import { ArrowRight, BadgeCheck, MapPin, MessageSquare, ShieldCheck } from "lucide-react"
import { LikeButton } from "@/components/like-button"
import { FeedShareButton } from "@/components/feed-share-button"
import { CATEGORY_LABELS, relativeTimeFr } from "@/lib/report"
import type { Evidence, Report } from "@/lib/generated/prisma/client"

interface ReportCardProps {
  report: Report & { evidence: Evidence[] }
  likeCount?: number
  commentCount?: number
  initialLiked?: boolean
}

export function ReportCard({ report, likeCount = 0, commentCount = 0, initialLiked = false }: ReportCardProps) {
  const detailsHref = `/signalement/${report.slug}`
  const commentHref = `${detailsHref}#commentaires`
  const authorName = report.authorName ? `@${report.authorName}` : "Dénonciateur anonyme"
  const initial = (report.authorName ?? "Laza").slice(0, 1).toUpperCase()
  const evidenceCount = report.evidence.length

  return (
    <article className="rounded-2xl border border-hairline bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      {/* Auteur, date, référence du dossier */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-deep/10 font-newsreader text-[16px] font-semibold text-teal-deep"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <span className="truncate">{authorName}</span>
            <BadgeCheck className="size-4 shrink-0 text-teal-deep" aria-label="Dossier vérifié" />
          </p>
          <p className="text-[13px] text-muted-ink">
            {relativeTimeFr(report.publishedAt ?? report.createdAt)}
          </p>
        </div>
        <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-ink sm:inline">
          {report.reference}
        </span>
      </div>

      <Link href={detailsHref} className="mt-3 block">
        <h2 className="font-newsreader text-[19px] font-semibold leading-[1.25em] text-ink transition-colors hover:text-teal-deep sm:text-[21px]">
          {report.title}
        </h2>
      </Link>

      <p className="mt-2 line-clamp-3 text-[15px] leading-[1.6em] text-ink-muted">{report.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-paper px-2.5 py-1 text-[12px] font-medium text-ink">
          {CATEGORY_LABELS[report.category]}
        </span>
        {report.region ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[12px] text-ink-muted">
            <MapPin className="size-3.5" />
            {report.region}
          </span>
        ) : null}
        {evidenceCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secure/10 px-2.5 py-1 text-[12px] font-medium text-secure">
            <ShieldCheck className="size-3.5" />
            {evidenceCount} preuve{evidenceCount > 1 ? "s" : ""} à l&apos;appui
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-0.5 border-t border-hairline pt-3 text-muted-ink">
        <Link
          href={commentHref}
          aria-label="Voir les commentaires"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] transition-colors hover:bg-paper hover:text-teal-deep"
        >
          <MessageSquare className="size-[17px]" />
          <span className="tabular-nums">{commentCount}</span>
        </Link>

        <LikeButton slug={report.slug} initialCount={likeCount} initialLiked={initialLiked} />

        <FeedShareButton title={report.title} path={detailsHref} />

        <Link
          href={detailsHref}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[14px] font-semibold text-teal-deep transition-colors hover:bg-teal-deep/5"
        >
          Lire la fiche
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  )
}
