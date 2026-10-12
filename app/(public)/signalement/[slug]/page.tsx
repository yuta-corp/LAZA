import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { ArrowLeft, ArrowUpRight, BadgeCheck, MapPin, MessageSquare } from "lucide-react"
import { ShareButtons } from "@/components/share-buttons"
import { LikeButton } from "@/components/like-button"
import { FeedShareButton } from "@/components/feed-share-button"
import { CommentSection } from "@/components/comment-section"
import { LegalWarning } from "@/components/legal-warning"
import {
  EVIDENCE_ICONS,
  EVIDENCE_LABELS,
  formatBytes,
  formatDateLong,
  mimeExtension,
} from "@/lib/report"
import { FINGERPRINT_COOKIE } from "@/lib/constants"
import { categoryLabel, getCopy, LANG_COOKIE, normalizeLang } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { EvidenceKind, VerificationStatus } from "@/lib/generated/prisma/enums"
import { cn } from "@/lib/utils"

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
      images: [
        {
          url: "/brand/og.png",
          width: 1200,
          height: 630,
          alt: `${report.title} — dossier vérifié sur Laza`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: report.title,
      description: report.summary,
      images: ["/brand/og.png"],
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
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value)
  const t = getCopy(lang).dossier

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

  const publishedAt = report.publishedAt ?? report.createdAt
  const evidenceCount = report.evidence.length
  const commitment = report.identityCommitment
    ? `${report.identityCommitment.slice(0, 12)}…`
    : null

  return (
    <div className="bg-canvas-tint">
      {/* Bandeau de lecture : retour, référence, statut */}
      <div className="sticky top-14 z-30 flex items-center gap-3 border-b border-hairline bg-white/90 px-4 py-2.5 backdrop-blur md:top-0">
        <Link
          href="/fil"
          aria-label={t.back}
          className="inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-ink">
          {report.reference}
        </p>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-secure/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secure">
          <BadgeCheck className="size-3.5" />
          {t.verified}
        </span>
      </div>

      <article className="px-4 py-8 sm:px-6">
        {/* Couverture */}
        <header>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-deep">
            {t.kicker}
          </p>
          <h1 className="mt-3 font-newsreader text-[30px] font-medium leading-[1.08em] tracking-[-0.02em] text-balance text-ink sm:text-[40px]">
            {report.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            {report.region ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-teal-deep" />
                {report.region}
              </span>
            ) : null}
            <span aria-hidden="true" className="text-hairline-strong">
              ·
            </span>
            <span>{formatDateLong(publishedAt)}</span>
          </p>
        </header>

        {/* Fiche signalétique */}
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4">
          <MetaCell label={t.category} value={categoryLabel(lang, report.category)} />
          <MetaCell label={t.region} value={report.region ?? "—"} />
          <MetaCell label={t.receivedOn} value={formatDateLong(report.createdAt)} />
          <MetaCell label={t.publishedOn} value={formatDateLong(publishedAt)} />
        </dl>

        {/* Chapeau */}
        <p className="mt-8 font-newsreader text-[19px] leading-[1.5em] text-ink sm:text-[21px]">
          {report.summary}
        </p>

        {/* Corps */}
        <section className="mt-8">
          <SectionHeading>{t.facts}</SectionHeading>
          <p className="mt-4 whitespace-pre-wrap text-[16px] leading-[1.75em] text-ink-muted">
            {report.description}
          </p>
        </section>

        {/* Pièces à conviction */}
        <section className="mt-10">
          <SectionHeading>
            {t.evidence}
            {evidenceCount > 0 ? (
              <span className="ml-2 font-sans text-[13px] font-normal normal-case tracking-normal text-muted-ink">
                {evidenceCount.toString().padStart(2, "0")}
              </span>
            ) : null}
          </SectionHeading>

          {evidenceCount === 0 ? (
            <p className="mt-4 text-[15px] text-muted-ink">{t.evidenceEmpty}</p>
          ) : (
            <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
              {report.evidence.map((evidence, index) => {
                const Icon = EVIDENCE_ICONS[evidence.kind]
                const label = EVIDENCE_LABELS[evidence.kind]
                const verified = evidence.verificationStatus === VerificationStatus.VERIFIED
                const rejected = evidence.verificationStatus === VerificationStatus.REJECTED
                return (
                  <li key={evidence.id} className="flex items-start gap-3 py-3.5">
                    <span className="mt-0.5 w-6 shrink-0 font-mono text-[12px] tabular-nums text-muted-ink">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-deep/8 text-teal-deep">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">
                        {evidence.fileName}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-ink">
                        <span>{label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{mimeExtension(evidence.mimeType)}</span>
                        {evidence.size ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{formatBytes(evidence.size, lang)}</span>
                          </>
                        ) : null}
                      </p>
                      {evidence.checksum ? (
                        <p className="mt-1 font-mono text-[11px] text-muted-ink/80">
                          {t.evidenceHash} · {evidence.checksum.slice(0, 12)}…
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider",
                          verified && "text-secure",
                          rejected && "text-vermilion",
                          !verified && !rejected && "text-muted-ink",
                        )}
                      >
                        {verified ? t.evidenceVerified : rejected ? t.evidenceRejected : t.evidencePending}
                      </span>
                      {evidence.url ? (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-teal-deep hover:underline"
                        >
                          {evidence.kind === EvidenceKind.LINK ? t.evidenceOpenLink : t.evidenceOpen}
                          <ArrowUpRight className="size-3" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Anonymat */}
        <section className="mt-10 rounded-lg border border-hairline bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-ink">
                {t.anonymity}
              </p>
              <p className="mt-1 font-newsreader text-[18px] font-semibold text-ink">
                {report.authorName ? `@${report.authorName}` : t.anonymous}
              </p>
            </div>
            <BadgeCheck className="size-5 shrink-0 text-teal-deep" aria-hidden="true" />
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{t.anonymityNote}</p>
          {commitment ? (
            <p className="mt-3 font-mono text-[11px] text-muted-ink">
              {t.fingerprint} · {commitment}
            </p>
          ) : null}
          <p className="mt-1 text-[12px] text-muted-ink">{t.verifiedBy}</p>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
          <div className="flex items-center gap-1">
            <Link
              href="#commentaires"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-teal-deep"
            >
              <MessageSquare className="size-[17px]" />
              <span className="tabular-nums">{t.comments(report.comments.length)}</span>
            </Link>
            <LikeButton slug={report.slug} initialCount={likeCount} initialLiked={Boolean(initialLiked)} />
            <FeedShareButton title={report.title} path={`/signalement/${report.slug}`} />
          </div>
          <ShareButtons title={report.title} path={`/signalement/${report.slug}`} />
        </div>
      </article>

      <div className="border-t border-hairline">
        <CommentSection
          slug={report.slug}
          comments={report.comments}
          initialIdentity={identity ? { pseudo: identity.pseudo } : null}
        />
      </div>

      <div className="border-t border-hairline px-4 py-6 sm:px-6">
        <LegalWarning compact />
      </div>
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3.5 py-3">
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-ink">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] font-medium leading-snug text-ink">{value}</dd>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-ink">
      {children}
    </h2>
  )
}
