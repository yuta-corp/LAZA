"use client"

import { useState, useTransition } from "react"
import {
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Loader2,
  Mic,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  CommentStatus,
  EvidenceKind,
  VerificationStatus,
} from "@/lib/generated/prisma/enums"

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return "Action impossible — réessayez."
}

function evidenceFormData(
  evidenceId: string,
  reportId: string,
  status: VerificationStatus
): FormData {
  const fd = new FormData()
  fd.set("evidenceId", evidenceId)
  fd.set("reportId", reportId)
  fd.set("status", status)
  return fd
}

function commentFormData(commentId: string, reportId: string, note?: string): FormData {
  const fd = new FormData()
  fd.set("commentId", commentId)
  fd.set("reportId", reportId)
  if (note !== undefined) fd.set("moderationNote", note)
  return fd
}

function reportFormData(reportId: string, note?: string): FormData {
  const fd = new FormData()
  fd.set("id", reportId)
  if (note !== undefined) fd.set("moderationNote", note)
  return fd
}

function Spinner() {
  return <Loader2 className="size-3.5 animate-spin" />
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

export interface EvidenceRow {
  id: string
  fileName: string
  size: number
  checksum: string | null
  url: string | null
  kind: EvidenceKind
  verificationStatus: VerificationStatus
}

/** Pièce de preuve : badge de vérification en direct + actions Vérifiée/Écartée/Réinitialiser. */
export function EvidenceItem({ evidence, reportId }: { evidence: EvidenceRow; reportId: string }) {
  const [status, setStatus] = useState(evidence.verificationStatus)
  const [busy, setBusy] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const Icon = EVIDENCE_ICONS[evidence.kind]
  const verified = status === VerificationStatus.VERIFIED
  const rejected = status === VerificationStatus.REJECTED

  const apply = (next: VerificationStatus) => {
    startTransition(async () => {
      setBusy(next)
      try {
        await setEvidenceStatus(evidenceFormData(evidence.id, reportId, next))
        setStatus(next)
        toast.success(
          next === VerificationStatus.VERIFIED
            ? "Preuve vérifiée."
            : next === VerificationStatus.REJECTED
              ? "Preuve écartée."
              : "Preuve remise à vérifier."
        )
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setBusy(null)
      }
    })
  }

  return (
    <li className="rounded-lg border p-3 text-sm">
      <div className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{evidence.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {EVIDENCE_LABELS[evidence.kind]} · {formatSize(evidence.size)} · SHA-256{" "}
            {evidence.checksum && (
              <span className="font-mono" title={evidence.checksum}>
                {mask(evidence.checksum)}
              </span>
            )}
          </p>
        </div>
        <Badge
          variant={verified ? "default" : rejected ? "destructive" : "outline"}
          className={verified ? "bg-emerald-600/10 text-emerald-600" : ""}
        >
          {VERIFICATION_LABELS[status]}
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
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600"
            onClick={() => apply(VerificationStatus.VERIFIED)}
            disabled={pending}
            aria-label="Marquer cette preuve comme vérifiée"
          >
            {busy === VerificationStatus.VERIFIED ? <Spinner /> : <ShieldCheck className="size-3.5" />}
            Vérifiée
          </Button>
        )}
        {!rejected && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={() => apply(VerificationStatus.REJECTED)}
            disabled={pending}
            aria-label="Écarter cette preuve"
          >
            {busy === VerificationStatus.REJECTED ? <Spinner /> : <ShieldAlert className="size-3.5" />}
            Écartée
          </Button>
        )}
        {status !== VerificationStatus.PENDING && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => apply(VerificationStatus.PENDING)}
            disabled={pending}
            aria-label="Remettre cette preuve à vérifier"
          >
            {busy === VerificationStatus.PENDING ? <Spinner /> : <RotateCcw className="size-3.5" />}
            Réinitialiser
          </Button>
        )}
      </div>
    </li>
  )
}

export interface CommentRow {
  id: string
  authorName: string | null
  content: string
  moderationNote: string | null
  status: CommentStatus
  createdAt: Date
}

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Commentaire : badge en direct + pré-modération Approuver/Rejeter/Remettre en attente. */
export function CommentItem({ comment, reportId }: { comment: CommentRow; reportId: string }) {
  const [status, setStatus] = useState(comment.status)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (action: string, fn: () => Promise<void>, success: string) => {
    startTransition(async () => {
      setBusy(action)
      try {
        await fn()
        if (action === "approve") setStatus(CommentStatus.PUBLISHED)
        if (action === "reject") {
          setStatus(CommentStatus.REJECTED)
          setOpen(false)
          setNote("")
        }
        if (action === "reopen") setStatus(CommentStatus.PENDING)
        toast.success(success)
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setBusy(null)
      }
    })
  }

  return (
    <li className="rounded-lg border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{comment.authorName ?? "Anonyme"}</span>
        <Badge
          variant={
            status === CommentStatus.PUBLISHED
              ? "default"
              : status === CommentStatus.REJECTED
                ? "destructive"
                : "outline"
          }
        >
          {COMMENT_STATUS_LABELS[status]}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">{formatDateFr(comment.createdAt)}</span>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-foreground/90">{comment.content}</p>
      {comment.moderationNote && (
        <p className="mt-1.5 text-xs text-destructive">Note : {comment.moderationNote}</p>
      )}
      <div className="mt-2 flex flex-wrap items-start gap-1.5">
        {status !== CommentStatus.PUBLISHED && (
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600"
            onClick={() =>
              run(
                "approve",
                () => approveComment(commentFormData(comment.id, reportId)),
                "Commentaire approuvé et publié."
              )
            }
            disabled={pending}
            aria-label="Approuver ce commentaire"
          >
            {busy === "approve" ? <Spinner /> : <ShieldCheck className="size-3.5" />}
            Approuver
          </Button>
        )}
        {status !== CommentStatus.REJECTED && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={() => setOpen((v) => !v)}
            disabled={pending}
            aria-expanded={open}
            aria-label="Rejeter ce commentaire"
          >
            <ShieldAlert className="size-3.5" />
            Rejeter
          </Button>
        )}
        {status !== CommentStatus.PENDING && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              run(
                "reopen",
                () => reopenComment(commentFormData(comment.id, reportId)),
                "Commentaire remis en attente."
              )
            }
            disabled={pending}
            aria-label="Remettre ce commentaire en attente"
          >
            {busy === "reopen" ? <Spinner /> : <RotateCcw className="size-3.5" />}
            Remettre en attente
          </Button>
        )}
        {open && (
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (note.trim().length === 0) return
              run(
                "reject",
                () => rejectComment(commentFormData(comment.id, reportId, note.trim())),
                "Commentaire rejeté."
              )
            }}
          >
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Note de modération (facultative)"
              className="min-h-16 bg-background"
              aria-label="Note de modération du rejet"
            />
            <div className="flex gap-1.5">
              <Button
                type="submit"
                size="sm"
                variant="destructive"
                disabled={pending || note.trim().length === 0}
              >
                {busy === "reject" ? <Spinner /> : <ShieldAlert className="size-3.5" />}
                Confirmer le rejet
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </li>
  )
}

export interface DecisionReport {
  id: string
  status: string
}

/** Décision de modération : prendre en charge / publier / rouvrir / rejeter. */
export function DecisionModeration({ report }: { report: DecisionReport }) {
  const [status, setStatus] = useState(report.status)
  const [openReject, setOpenReject] = useState(false)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const actionable = status === "SUBMITTED" || status === "UNDER_REVIEW"

  const run = (action: string, fn: () => Promise<void>, success: string) => {
    startTransition(async () => {
      setBusy(action)
      try {
        await fn()
        if (action === "take") setStatus("UNDER_REVIEW")
        if (action === "publish") setStatus("PUBLISHED")
        if (action === "reopen") setStatus("UNDER_REVIEW")
        if (action === "reject") {
          setStatus("REJECTED")
          setOpenReject(false)
          setNote("")
        }
        toast.success(success)
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setBusy(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {status === "SUBMITTED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => run("take", () => takeReport(reportFormData(report.id)), "Signalement pris en charge.")}
            disabled={pending}
            aria-label="Prendre ce signalement en charge"
          >
            {busy === "take" ? <Spinner /> : null}
            Prendre en charge
          </Button>
        )}

        {actionable && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => run("publish", () => publishReport(reportFormData(report.id)), "Signalement publié.")}
            disabled={pending}
            aria-label="Publier ce signalement"
          >
            {busy === "publish" ? <Spinner /> : <ShieldCheck className="size-4" />}
            Publier le signalement
          </Button>
        )}

        {!actionable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => run("reopen", () => reopenReport(reportFormData(report.id)), "Signalement repassé en examen.")}
            disabled={pending}
            aria-label="Repasser ce signalement en examen"
          >
            {busy === "reopen" ? <Spinner /> : <RotateCcw className="size-4" />}
            Repasser en examen
          </Button>
        )}
      </div>

      {actionable && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          {!openReject ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setOpenReject(true)}
              disabled={pending}
              aria-expanded={openReject}
              aria-label="Rejeter ce signalement"
            >
              <ShieldAlert className="size-4" />
              Rejeter le signalement
            </Button>
          ) : (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (note.trim().length === 0) return
                run(
                  "reject",
                  () => rejectReport(reportFormData(report.id, note.trim())),
                  "Signalement rejeté."
                )
              }}
            >
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                name="moderationNote"
                required
                placeholder="Note de modération (obligatoire en cas de rejet) : preuves insuffisantes, fait non étayé…"
                className="min-h-24 bg-background"
                aria-label="Note de modération du rejet"
              />
              <div className="flex gap-1.5">
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  disabled={pending || note.trim().length === 0}
                >
                  {busy === "reject" ? <Spinner /> : <ShieldAlert className="size-4" />}
                  Confirmer le rejet
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpenReject(false)} disabled={pending}>
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}