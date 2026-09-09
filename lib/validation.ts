import { Category, EvidenceKind } from "@/lib/generated/prisma/enums"

export const CATEGORIES: Category[] = [
  Category.MARCHES_PUBLICS,
  Category.FONCIER,
  Category.DOUANES_IMPOTS,
  Category.SANTE,
  Category.EDUCATION,
  Category.JUSTICE,
  Category.SECURITE,
  Category.MINES,
  Category.TELECOMS,
  Category.ENERGIE,
  Category.AUTRE,
]

export const MAX_EVIDENCE_FILES = 5
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

export const ALLOWED_MIME_TYPES: Record<EvidenceKind, string[]> = {
  [EvidenceKind.IMAGE]: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  [EvidenceKind.VIDEO]: ["video/mp4", "video/webm", "video/quicktime"],
  [EvidenceKind.AUDIO]: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/aac"],
  [EvidenceKind.DOCUMENT]: ["application/pdf"],
  [EvidenceKind.LINK]: [],
}

export function evidenceKindFromMime(mimeType: string): EvidenceKind | null {
  for (const [kind, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) {
      return kind as EvidenceKind
    }
  }
  return null
}

export const TEXT_RULES = {
  title: { min: 10, max: 140 },
  summary: { min: 20, max: 300 },
  description: { min: 40, max: 5000 },
  region: { max: 60 },
} as const

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as string[]).includes(value)
}

/** Numéro CIN malgache : 10 à 14 chiffres (espaces et tirets tolérés). */
export function normalizeCin(input: string): string {
  return input.replace(/[\s-]/g, "")
}

export function isValidCin(input: string): boolean {
  return /^\d{10,14}$/.test(normalizeCin(input))
}

export function isValidDateOfBirth(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return false
  }
  const date = new Date(`${input}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date < new Date()
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const PSEUDO_RULES = { min: 2, max: 24 } as const

/** Pseudo public : 2 à 24 caractères (lettres, chiffres, « . _ - », espace interne). */
export function isValidPseudo(input: string): boolean {
  if (input.length < PSEUDO_RULES.min || input.length > PSEUDO_RULES.max) {
    return false
  }
  return /^[A-Za-z0-9À-ÿ][A-Za-z0-9À-ÿ._ -]*[A-Za-z0-9À-ÿ]$/.test(input)
}