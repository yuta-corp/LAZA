import Link from "next/link"
import { BadgeCheck, MapPin, MessageSquare, Paperclip, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LikeButton } from "@/components/like-button"
import { FeedShareButton } from "@/components/feed-share-button"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, EVIDENCE_ICONS, relativeTimeFr } from "@/lib/report"
import { EvidenceKind } from "@/lib/generated/prisma/enums"
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

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex gap-3">
        <Link
          href={detailsHref}
          aria-label="Voir le signalement"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <ShieldCheck className="size-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            <span className="font-semibold text-foreground">
              {report.authorName ? `@${report.authorName}` : "Dénonciateur anonyme"}
            </span>
            <BadgeCheck className="size-4 shrink-0 text-accent" aria-label="Identité engagée" />
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{relativeTimeFr(report.publishedAt ?? report.createdAt)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">{report.reference}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
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

          <div className="mt-1.5 space-y-1">
            <Link href={detailsHref} className="block">
              <h2 className="text-[15px] font-bold leading-snug text-foreground hover:underline">
                {report.title}
              </h2>
            </Link>
            <p className="text-[15px] leading-relaxed text-foreground/80 line-clamp-3">
              {report.summary}
            </p>
          </div>

          {report.evidence.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Paperclip className="size-3.5" />
                {report.evidence.length} preuve{report.evidence.length > 1 ? "s" : ""}
              </span>
              {Object.entries(
                report.evidence.reduce<Record<string, number>>((acc, e) => {
                  acc[e.kind] = (acc[e.kind] ?? 0) + 1
                  return acc
                }, {})
              ).map(([kind, count]) => {
                const Icon = EVIDENCE_ICONS[kind as EvidenceKind]
                return (
                  <span key={kind} className="inline-flex items-center gap-1">
                    <Icon className="size-3.5" />
                    {count}
                  </span>
                )
              })}
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-1 border-t border-border pt-2 text-muted-foreground">
            <Link
              href={commentHref}
              aria-label="Voir les commentaires"
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <MessageSquare className="size-[18px]" />
              <span className="tabular-nums">{commentCount}</span>
            </Link>
            <div className="rounded-full transition-colors hover:bg-accent/10">
              <LikeButton slug={report.slug} initialCount={likeCount} initialLiked={initialLiked} />
            </div>
            <div className="rounded-full transition-colors hover:bg-accent/10">
              <FeedShareButton title={report.title} path={detailsHref} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}