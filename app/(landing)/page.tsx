import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { LandingView, type LandingTeaser } from "@/app/(landing)/landing-view"
import { formatRelative } from "@/lib/report"

export const metadata: Metadata = {
  title: "Dénoncer la corruption, sans dire qui tu es",
  description:
    "Tu as subi ou vu un fait de corruption à Madagascar ? Raconte-le. Sans ton nom, sans compte, gratuit. Une équipe vérifie les preuves avant publication.",
}

// Les chiffres affichés sont lus en direct dans la base : rien n'est inventé.
export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const [published, evidenceCount, likeCount, commentCount, latest] = await Promise.all([
    prisma.report.count({ where: { status: "PUBLISHED" } }),
    prisma.evidence.count({ where: { report: { status: "PUBLISHED" } } }),
    prisma.reportLike.count(),
    prisma.comment.count({ where: { status: "PUBLISHED" } }),
    prisma.report.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { evidence: true },
    }),
  ])

  const teaser: LandingTeaser | null = latest
    ? {
        slug: latest.slug,
        title: latest.title,
        summary: latest.summary,
        category: latest.category,
        region: latest.region,
        evidenceCount: latest.evidence.length,
        time: {
          fr: formatRelative(latest.publishedAt ?? latest.createdAt, "fr"),
          mg: formatRelative(latest.publishedAt ?? latest.createdAt, "mg"),
        },
      }
    : null

  return (
    <LandingView
      stats={{
        published,
        evidence: evidenceCount,
        support: likeCount + commentCount,
      }}
      teaser={teaser}
    />
  )
}
