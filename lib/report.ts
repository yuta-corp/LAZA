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
  MARCHES_PUBLICS: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  FONCIER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  DOUANES_IMPOTS: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  SANTE: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  EDUCATION: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  JUSTICE: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  SECURITE: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  MINES: "bg-lime-500/10 text-lime-600 dark:text-lime-400",
  TELECOMS: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  ENERGIE: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  AUTRE: "bg-muted text-muted-foreground",
}

/** Formatte une date en français. */
export function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}