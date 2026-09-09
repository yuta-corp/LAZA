import type { PrismaClient } from "@/lib/generated/prisma/client"
import type { Category, ReportStatus } from "@/lib/generated/prisma/enums"
import { EvidenceKind } from "@/lib/generated/prisma/enums"
import { FileText, Film, Image as ImageIcon, Link2, Mic, type LucideIcon } from "lucide-react"

/** Génère un slug unique à partir d'un titre. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** Référence publique unique du signalement, ex. LAZ-2026-0001. */
export function buildReference(seq: number, date = new Date()): string {
  return `LAZ-${date.getFullYear()}-${String(seq).padStart(4, "0")}`
}

/** Prochaine référence disponible pour l'année en cours. */
export async function nextReference(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `LAZ-${year}-`
  const rows = await prisma.report.findMany({
    select: { reference: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  })
  let max = 0
  for (const { reference } of rows) {
    if (reference.startsWith(prefix)) {
      const seq = Number(reference.slice(prefix.length))
      if (!Number.isNaN(seq) && seq > max) {
        max = seq
      }
    }
  }
  return buildReference(max + 1)
}

/** Nombre de tentatives avant d'abandonner en cas de collision de référence. */
export const MAX_REFERENCE_RETRIES = 3

/**
 * Crée le signalement avec une référence unique, en retentant en cas de
 * collision (deux créations simultanées peuvent choisir la même référence,
 * contrainte @unique sur `reference`).
 */
export async function createReportWithReference<T extends { reference: string }>(
  prisma: PrismaClient,
  create: (reference: string) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_REFERENCE_RETRIES; attempt++) {
    try {
      return await create(await nextReference(prisma))
    } catch (error) {
      const isUniqueViolation =
        error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002"
      if (!isUniqueViolation || attempt === MAX_REFERENCE_RETRIES) {
        throw error
      }
    }
  }
  throw new Error("Impossible de générer une référence unique.")
}

export const CATEGORY_LABELS: Record<Category, string> = {
  MARCHES_PUBLICS: "Marchés publics",
  FONCIER: "Foncier & domaines",
  DOUANES_IMPOTS: "Douanes & impôts",
  SANTE: "Santé",
  EDUCATION: "Éducation",
  JUSTICE: "Justice",
  SECURITE: "Sécurité & police",
  MINES: "Mines & ressources",
  TELECOMS: "Télécoms & médias",
  ENERGIE: "Énergie & eau",
  AUTRE: "Autre",
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  SUBMITTED: "En cours de vérification",
  UNDER_REVIEW: "En cours d'examen",
  PUBLISHED: "Publié",
  REJECTED: "Non retenu",
}

export const CATEGORY_VARIANTS: Record<Category, string> = {
  MARCHES_PUBLICS: "bg-secondary text-secondary-foreground",
  FONCIER: "bg-secondary text-secondary-foreground",
  DOUANES_IMPOTS: "bg-secondary text-secondary-foreground",
  SANTE: "bg-secondary text-secondary-foreground",
  EDUCATION: "bg-secondary text-secondary-foreground",
  JUSTICE: "bg-secondary text-secondary-foreground",
  SECURITE: "bg-secondary text-secondary-foreground",
  MINES: "bg-secondary text-secondary-foreground",
  TELECOMS: "bg-secondary text-secondary-foreground",
  ENERGIE: "bg-secondary text-secondary-foreground",
  AUTRE: "bg-secondary text-secondary-foreground",
}

/** Pastille neutre associée à chaque catégorie (tendances, avatars). */
export const CATEGORY_DOTS: Record<Category, string> = {
  MARCHES_PUBLICS: "bg-accent",
  FONCIER: "bg-[#0c95ab]",
  DOUANES_IMPOTS: "bg-[#0c95ab]/70",
  SANTE: "bg-[#0c95ab]/50",
  EDUCATION: "bg-[#4b5563]",
  JUSTICE: "bg-[#4b5563]/70",
  SECURITE: "bg-[#4b5563]/50",
  MINES: "bg-[#9ca3af]",
  TELECOMS: "bg-[#9ca3af]/70",
  ENERGIE: "bg-[#9ca3af]/50",
  AUTRE: "bg-muted-foreground",
}

/** Formatte une date en français. */
export function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

/** Temps relatif (« il y a 3 h »), puis date courte au-delà de 7 jours. */
export function relativeTimeFr(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`
  return formatDateFr(date)
}

export const EVIDENCE_LABELS: Record<EvidenceKind, string> = {
  [EvidenceKind.DOCUMENT]: "Document",
  [EvidenceKind.IMAGE]: "Image",
  [EvidenceKind.VIDEO]: "Vidéo",
  [EvidenceKind.AUDIO]: "Audio",
  [EvidenceKind.LINK]: "Lien",
}

export const EVIDENCE_ICONS: Record<EvidenceKind, LucideIcon> = {
  [EvidenceKind.DOCUMENT]: FileText,
  [EvidenceKind.IMAGE]: ImageIcon,
  [EvidenceKind.VIDEO]: Film,
  [EvidenceKind.AUDIO]: Mic,
  [EvidenceKind.LINK]: Link2,
}