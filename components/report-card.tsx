import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  MessageSquare,
  Paperclip,
} from "lucide-react"
import { LikeButton } from "@/components/like-button"
import { FeedShareButton } from "@/components/feed-share-button"
import { formatRelative } from "@/lib/report"
import { categoryLabel, getCopy, type Lang } from "@/lib/i18n"
import type { Evidence, Report } from "@/lib/generated/prisma/client"

interface ReportCardProps {
  report: Report & { evidence: Evidence[] }
  likeCount?: number
  commentCount?: number
  initialLiked?: boolean
  lang?: Lang
}

export function ReportCard({
  report,
  likeCount = 0,
  commentCount = 0,
  initialLiked = false,
  lang = "fr",
}: ReportCardProps) {
  const t = getCopy(lang).dossier
  const detailsHref = `/signalement/${report.slug}`
  const commentHref = `${detailsHref}#commentaires`
  const authorName = report.authorName ? `@${report.authorName}` : t.anonymous
  const evidenceCount = report.evidence.length

  return (
    <article className="group/card border-b border-hairline bg-white px-4 py-5 transition-colors hover:bg-paper/60 sm:px-6">
      {/* Bandeau : référence, auteur, date */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-ink uppercase">
          {report.reference}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider text-secure uppercase">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
          {t.verified}
        </span>
        <span aria-hidden="true" className="text-hairline-strong">
          ·
        </span>
        <span className="truncate text-[12px] text-muted-ink">
          {authorName}
        </span>
        <span className="ml-auto shrink-0 text-[12px] text-muted-ink">
          {formatRelative(report.publishedAt ?? report.createdAt, lang)}
        </span>
      </div>

      <Link href={detailsHref} className="mt-3 block">
        <h2 className="font-newsreader text-[21px] leading-[1.18em] font-medium tracking-[-0.01em] text-ink transition-colors group-hover/card:text-teal-deep sm:text-[24px]">
          {report.title}
        </h2>
      </Link>

      <p className="mt-2 line-clamp-3 text-[15px] leading-[1.65em] text-ink-muted">
        {report.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-ink">
        <span className="font-medium text-ink">
          {categoryLabel(lang, report.category)}
        </span>
        {report.region ? (
          <>
            <span aria-hidden="true" className="text-hairline-strong">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {report.region}
            </span>
          </>
        ) : null}
        {evidenceCount > 0 ? (
          <>
            <span aria-hidden="true" className="text-hairline-strong">
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-secure">
              <Paperclip className="size-3.5" />
              {evidenceCount.toString().padStart(2, "0")}
            </span>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-0.5 text-muted-ink">
        <Link
          href={commentHref}
          aria-label={t.comments(commentCount)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] transition-colors hover:bg-paper hover:text-teal-deep"
        >
          <MessageSquare className="size-[17px]" />
          <span className="tabular-nums">{commentCount}</span>
        </Link>

        <LikeButton
          slug={report.slug}
          initialCount={likeCount}
          initialLiked={initialLiked}
        />

        <FeedShareButton title={report.title} path={detailsHref} />

        <Link
          href={detailsHref}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[14px] font-semibold text-teal-deep transition-colors hover:bg-teal-deep/5"
        >
          {t.read}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  )
}
