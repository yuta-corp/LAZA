import type { PrismaClient } from "@/lib/generated/prisma/client"
import type { Category, ReportStatus } from "@/lib/generated/prisma/enums"

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