import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Film,
  Fingerprint,
  Image as ImageIcon,
  Link2,
  MapPin,
  MessageSquare,
  Mic,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  approveComment,
  publishReport,
  rejectComment,
  rejectReport,
  reopenComment,
  reopenReport,
  setEvidenceStatus,
  takeReport,
} from "@/app/admin/actions"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, formatDateFr, STATUS_LABELS } from "@/lib/report"
import { CommentStatus, EvidenceKind, VerificationStatus } from "@/lib/generated/prisma/enums"

interface DetailPageProps {
  params: Promise<{ id: string }>
}

const EVIDENCE_ICONS: Record<EvidenceKind, typeof FileText> = {
  [EvidenceKind.DOCUMENT]: FileText,
  [EvidenceKind.IMAGE]: ImageIcon,
  [EvidenceKind.VIDEO]: Film,
  [EvidenceKind.AUDIO]: Mic,
  [EvidenceKind.LINK]: Link2,
}

const EVIDENCE_LABELS: Record<EvidenceKind, string> = {
  [EvidenceKind.DOCUMENT]: "Document",
  [EvidenceKind.IMAGE]: "Image",
  [EvidenceKind.VIDEO]: "Vidéo",
  [EvidenceKind.AUDIO]: "Audio",
  [EvidenceKind.LINK]: "Lien",
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.PENDING]: "À vérifier",
  [VerificationStatus.VERIFIED]: "Vérifiée",
  [VerificationStatus.REJECTED]: "Écartée",
}

const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  [CommentStatus.PENDING]: "En attente",
  [CommentStatus.PUBLISHED]: "Publié",
  [CommentStatus.REJECTED]: "Rejeté",
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "lien"
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
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
            {report.evidence.map((evidence) => {
              const Icon = EVIDENCE_ICONS[evidence.kind]
              const verified = evidence.verificationStatus === VerificationStatus.VERIFIED
              const rejected = evidence.verificationStatus === VerificationStatus.REJECTED
              return (
                <li key={evidence.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{evidence.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {EVIDENCE_LABELS[evidence.kind]} · {formatSize(evidence.size)} · SHA-256{" "}
                        <span className="font-mono" title={evidence.checksum}>
                          {mask(evidence.checksum)}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant={verified ? "default" : rejected ? "destructive" : "outline"}
                      className={verified ? "bg-emerald-600/10 text-emerald-600" : ""}
                    >
                      {VERIFICATION_LABELS[evidence.verificationStatus]}
                    </Badge>
                    {evidence.url && (
                      <a
                        href={evidence.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Consulter
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {!verified && (
                      <form action={setEvidenceStatus}>
                        <input type="hidden" name="evidenceId" value={evidence.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="status" value={VerificationStatus.VERIFIED} />
                        <Button size="sm" variant="outline" className="text-emerald-600">
                          <ShieldCheck className="size-3.5" />
                          Vérifiée
                        </Button>
                      </form>
                    )}
                    {!rejected && (
                      <form action={setEvidenceStatus}>
                        <input type="hidden" name="evidenceId" value={evidence.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="status" value={VerificationStatus.REJECTED} />
                        <Button size="sm" variant="outline" className="text-destructive">
                          <ShieldAlert className="size-3.5" />
                          Écartée
                        </Button>
                      </form>
                    )}
                    {evidence.verificationStatus !== VerificationStatus.PENDING && (
                      <form action={setEvidenceStatus}>
                        <input type="hidden" name="evidenceId" value={evidence.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="status" value={VerificationStatus.PENDING} />
                        <Button size="sm" variant="ghost">
                          <RotateCcw className="size-3.5" />
                          Réinitialiser
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              )
            })}
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
                <li key={comment.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{comment.authorName ?? "Anonyme"}</span>
                    <Badge
                      variant={
                        comment.status === "PUBLISHED"
                          ? "default"
                          : comment.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {COMMENT_STATUS_LABELS[comment.status]}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDateFr(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-foreground/90">
                    {comment.content}
                  </p>
                  {comment.moderationNote && (
                    <p className="mt-1.5 text-xs text-destructive">
                      Note : {comment.moderationNote}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {comment.status !== "PUBLISHED" && (
                      <form action={approveComment}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <Button size="sm" variant="outline" className="text-emerald-600">
                          <ShieldCheck className="size-3.5" />
                          Approuver
                        </Button>
                      </form>
                    )}
                    {comment.status !== "REJECTED" && (
                      <form action={rejectComment}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <Button size="sm" variant="outline" className="text-destructive">
                          <ShieldAlert className="size-3.5" />
                          Rejeter
                        </Button>
                      </form>
                    )}
                    {comment.status !== "PENDING" && (
                      <form action={reopenComment}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <Button size="sm" variant="ghost">
                          <RotateCcw className="size-3.5" />
                          Remettre en attente
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {report.status === "SUBMITTED" && (
              <form action={takeReport}>
                <input type="hidden" name="id" value={report.id} />
                <Button size="sm" variant="outline">
                  Prendre en charge
                </Button>
              </form>
            )}

            {actionable && (
              <form action={publishReport}>
                <input type="hidden" name="id" value={report.id} />
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <ShieldCheck className="size-4" />
                  Publier le signalement
                </Button>
              </form>
            )}

            {!actionable && (
              <form action={reopenReport}>
                <input type="hidden" name="id" value={report.id} />
                <Button size="sm" variant="outline">
                  <RotateCcw className="size-4" />
                  Repasser en examen
                </Button>
              </form>
            )}
          </div>

          {actionable && (
            <form
              action={rejectReport}
              className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            >
              <input type="hidden" name="id" value={report.id} />
              <Textarea
                name="moderationNote"
                required
                placeholder="Note de modération (obligatoire en cas de rejet) : preuves insuffisantes, fait non étayé…"
                className="min-h-24 bg-background"
              />
              <Button size="sm" variant="destructive">
                <ShieldAlert className="size-4" />
                Rejeter le signalement
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}