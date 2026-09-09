"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CommentStatus, VerificationStatus } from "@/lib/generated/prisma/enums"

function reportIdFrom(formData: FormData): string {
  const id = formData.get("id")
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Identifiant de signalement manquant.")
  }
  return id
}

function revalidateAll(reportId: string) {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath(`/admin/reports/${reportId}`)
}

/** Passe le signalement en « examen » et s'attribue la modération. */
export async function takeReport(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const id = reportIdFrom(formData)
  await prisma.report.update({
    where: { id },
    data: {
      status: "UNDER_REVIEW",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })
  revalidateAll(id)
}

/** Publie le signalement (visible sur le fil public). */
export async function publishReport(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const id = reportIdFrom(formData)
  await prisma.report.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
  })
  revalidateAll(id)
}

/** Rejette le signalement — la note de modération est obligatoire. */
export async function rejectReport(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const id = reportIdFrom(formData)
  const rawNote = formData.get("moderationNote")
  const note = typeof rawNote === "string" ? rawNote.trim() : ""
  if (!note) {
    throw new Error("La note de modération est obligatoire pour rejeter un signalement.")
  }
  await prisma.report.update({
    where: { id },
    data: {
      status: "REJECTED",
      moderationNote: note,
      rejectedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
  })
  revalidateAll(id)
}

/** Repasse un signalement publié ou rejeté en examen (erreur de modération). */
export async function reopenReport(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const id = reportIdFrom(formData)
  await prisma.report.update({
    where: { id },
    data: {
      status: "UNDER_REVIEW",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })
  revalidateAll(id)
}

const EVIDENCE_STATUSES: VerificationStatus[] = [
  VerificationStatus.PENDING,
  VerificationStatus.VERIFIED,
  VerificationStatus.REJECTED,
]

/** Définit l'état de vérification d'une pièce de preuve. */
export async function setEvidenceStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const evidenceId = formData.get("evidenceId")
  const reportId = formData.get("reportId")
  const rawStatus = formData.get("status")
  if (
    typeof evidenceId !== "string" ||
    typeof reportId !== "string" ||
    typeof rawStatus !== "string" ||
    !EVIDENCE_STATUSES.includes(rawStatus as VerificationStatus)
  ) {
    throw new Error("Paramètres invalides.")
  }
  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { verificationStatus: rawStatus as VerificationStatus },
  })
  revalidateAll(reportId)
}

/** Approuve un commentaire en attente (pré-modération). */
export async function approveComment(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const commentId = formData.get("commentId")
  const reportId = formData.get("reportId")
  if (typeof commentId !== "string" || typeof reportId !== "string") {
    throw new Error("Paramètres invalides.")
  }
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: CommentStatus.PUBLISHED,
      publishedAt: new Date(),
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })
  revalidateAll(reportId)
}

/** Rejette un commentaire — la note de modération est facultative. */
export async function rejectComment(formData: FormData): Promise<void> {
  const reviewerId = await requireAdmin()
  const commentId = formData.get("commentId")
  const reportId = formData.get("reportId")
  if (typeof commentId !== "string" || typeof reportId !== "string") {
    throw new Error("Paramètres invalides.")
  }
  const rawNote = formData.get("moderationNote")
  const note = typeof rawNote === "string" ? rawNote.trim() : ""
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: CommentStatus.REJECTED,
      moderationNote: note || null,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })
  revalidateAll(reportId)
}

/** Repasse un commentaire rejeté en attente (erreur de modération). */
export async function reopenComment(formData: FormData): Promise<void> {
  await requireAdmin()
  const commentId = formData.get("commentId")
  const reportId = formData.get("reportId")
  if (typeof commentId !== "string" || typeof reportId !== "string") {
    throw new Error("Paramètres invalides.")
  }
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: CommentStatus.PENDING,
      publishedAt: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  })
  revalidateAll(reportId)
}