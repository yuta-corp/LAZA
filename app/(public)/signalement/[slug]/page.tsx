import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { ArrowLeft, MapPin, MessageSquare, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShareButtons } from "@/components/share-buttons"
import { LikeButton } from "@/components/like-button"
import { FeedShareButton } from "@/components/feed-share-button"
import { CommentSection } from "@/components/comment-section"
import { LegalWarning } from "@/components/legal-warning"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, EVIDENCE_ICONS, EVIDENCE_LABELS, relativeTimeFr } from "@/lib/report"
import { FINGERPRINT_COOKIE } from "@/lib/constants"
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

export default async function SignalementPage({ params }: PageProps) {
  const { slug } = await params
  const report = await prisma.report.findUnique({
    where: { slug },
    include: {
      evidence: true,
      comments: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!report || report.status !== "PUBLISHED") {
    notFound()
  }

  const cookieStore = await cookies()
  const fingerprint = cookieStore.get(FINGERPRINT_COOKIE)?.value

  const [likeCount, initialLiked, identity] = await Promise.all([
    prisma.reportLike.count({ where: { reportId: report.id } }),
    fingerprint
      ? prisma.reportLike.findUnique({
          where: { reportId_fingerprint: { reportId: report.id, fingerprint } },
          select: { id: true },
        })
      : null,
    fingerprint
      ? prisma.identity.findUnique({ where: { fingerprint }, select: { pseudo: true } })
      : null,
  ])

  return (
    <div>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-2 py-2 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/fil" aria-label="Retour au fil" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <p className="text-base font-semibold leading-tight">Signalement</p>
          <p className="text-xs text-muted-foreground">{report.reference}</p>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
              <span className="font-semibold">Dénonciateur anonyme</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {relativeTimeFr(report.publishedAt ?? report.createdAt)}
              </span>
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
          </div>
        </div>

        <h1 className="mt-3 text-xl font-bold leading-tight">{report.title}</h1>
        <p className="mt-1 text-muted-foreground">{report.summary}</p>

        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
          {report.description}
        </p>

        {report.evidence.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">
              Preuves fournies ({report.evidence.length})
            </h2>
            <ul className="mt-2 space-y-2">
              {report.evidence.map((evidence) => {
                const Icon = EVIDENCE_ICONS[evidence.kind]
                const label = EVIDENCE_LABELS[evidence.kind]
                return (
                  <li
                    key={evidence.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm"
                  >
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:opacity-80"
                      >
                        {evidence.kind === EvidenceKind.LINK ? "Ouvrir la source" : "Consulter la preuve"}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="#commentaires"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <MessageSquare />
              {report.comments.length} commentaire{report.comments.length > 1 ? "s" : ""}
            </Link>
            <LikeButton slug={report.slug} initialCount={likeCount} initialLiked={Boolean(initialLiked)} />
            <FeedShareButton title={report.title} path={`/signalement/${report.slug}`} />
          </div>
          <div className="flex items-center gap-2">
            <ShareButtons title={report.title} path={`/signalement/${report.slug}`} />
          </div>
        </div>
      </div>

      <Separator />

      <CommentSection
        slug={report.slug}
        comments={report.comments}
        initialIdentity={identity ? { pseudo: identity.pseudo } : null}
      />

      <div className="border-t border-border px-4 py-6">
        <LegalWarning compact />
      </div>
    </div>
  )
}