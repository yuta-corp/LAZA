import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Fingerprint, MapPin, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CommentItem,
  DecisionModeration,
  EvidenceItem,
} from "@/app/admin/reports/[id]/moderation-actions"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, formatDateFr, STATUS_LABELS } from "@/lib/report"

interface DetailPageProps {
  params: Promise<{ id: string }>
}

function mask(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 14)}…` : hash
}

export default async function ReportDetailPage({ params }: DetailPageProps) {
  await requireAdmin()

  const { id } = await params
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      evidence: true,
      comments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!report) {
    notFound()
  }

  const reviewed =
    report.status === "UNDER_REVIEW" || report.status === "PUBLISHED" || report.status === "REJECTED"
  const actionable = report.status === "SUBMITTED" || report.status === "UNDER_REVIEW"

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6 md:gap-6">
      <Button variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link href="/admin" />}>
        <ArrowLeft className="size-4" />
        Retour à la file
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-mono text-sm">{report.reference}</CardTitle>
            <Badge variant="outline">{STATUS_LABELS[report.status]}</Badge>
            <span className="text-xs text-muted-foreground">Reçu le {formatDateFr(report.createdAt)}</span>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={CATEGORY_VARIANTS[report.category]}>
              {CATEGORY_LABELS[report.category]}
            </Badge>
            {report.region && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {report.region}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-xl font-bold leading-tight">{report.title}</h1>
            <p className="mt-1.5 text-muted-foreground">{report.summary}</p>
          </div>

          <Separator />

          <div className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
            {report.description}
          </div>

          {report.identityCommitment && (
            <div className="rounded-lg border p-3 text-xs text-muted-foreground">
              <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Fingerprint className="size-3.5" />
                Engagement d&apos;identité (anonyme)
              </p>
              <p className="mt-1 font-mono break-all" title={report.identityCommitment}>
                {mask(report.identityCommitment)}
              </p>
              <p className="mt-1">
                Empreinte SHA-256 calculée sur l&apos;appareil du dénonciateur — le serveur ne
                détient jamais le CIN ni la date de naissance. Levable uniquement sur réquisition
                judiciaire.
              </p>
            </div>
          )}

          {report.moderationNote && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">Note de modération (rejet)</p>
              <p className="mt-1 whitespace-pre-wrap">{report.moderationNote}</p>
            </div>
          )}

          {reviewed && (
            <p className="text-xs text-muted-foreground">
              Dernier examen : {formatDateFr(report.reviewedAt ?? report.updatedAt)}
              {report.reviewedBy ? ` · modérateur ${report.reviewedBy.slice(0, 8)}` : ""}
              {report.publishedAt ? ` · publié le ${formatDateFr(report.publishedAt)}` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preuves fournies ({report.evidence.length})</CardTitle>
          <CardDescription>
            Vérifiez chaque pièce : seule une preuve validée est considérée lors de la décision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.evidence.map((evidence) => (
              <EvidenceItem key={evidence.id} evidence={evidence} reportId={report.id} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <MessageSquare className="size-4 text-accent" />
            Commentaires ({report.comments.length})
          </CardTitle>
          <CardDescription>
            Pré-modération : un commentaire n&apos;est visible publiquement qu&apos;après approbation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {report.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} reportId={report.id} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Décision de modération</CardTitle>
          <CardDescription>
            {actionable
              ? "Après vérification des preuves, publiez le signalement ou rejetez-le avec une note."
              : report.status === "PUBLISHED"
                ? "Ce signalement est publié. Vous pouvez le repasser en examen si besoin."
                : "Ce signalement a été rejeté. Vous pouvez le rouvrir pour un nouvel examen."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DecisionModeration report={report} />
        </CardContent>
      </Card>
    </div>
  )
}