import { randomUUID } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { nextReference, slugify } from "@/lib/report"
import { saveEvidenceFile, sha256, removeEvidenceDir } from "@/lib/storage"
import {
  evidenceKindFromMime,
  isCategory,
  MAX_EVIDENCE_FILES,
  MAX_FILE_SIZE,
  TEXT_RULES,
} from "@/lib/validation"
import { Category, EvidenceKind } from "@/lib/generated/prisma/enums"

interface ClientHash {
  name: string
  sha256: string
}

function formString(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  const form = await request.formData()

  const title = formString(form, "title")
  const summary = formString(form, "summary")
  const description = formString(form, "description")
  const categoryRaw = formString(form, "category")
  const region = formString(form, "region")
  const legalAccepted = form.get("legalAccepted") === "true"
  const identityCommitment = formString(form, "identityCommitment") || null
  const commitmentSalt = formString(form, "commitmentSalt") || null

  const links = parseJsonArray<string>(formString(form, "links")).filter(
    (l) => typeof l === "string" && l.length > 0,
  )
  const clientHashes = parseJsonArray<ClientHash>(formString(form, "evidenceHashes"))
  const files = form.getAll("evidence").filter((v): v is File => v instanceof File)

  const errors: string[] = []

  if (title.length < TEXT_RULES.title.min || title.length > TEXT_RULES.title.max) {
    errors.push(`Le titre doit contenir entre ${TEXT_RULES.title.min} et ${TEXT_RULES.title.max} caractères.`)
  }
  if (summary.length < TEXT_RULES.summary.min || summary.length > TEXT_RULES.summary.max) {
    errors.push(`Le résumé doit contenir entre ${TEXT_RULES.summary.min} et ${TEXT_RULES.summary.max} caractères.`)
  }
  if (description.length < TEXT_RULES.description.min) {
    errors.push(`La description doit contenir au moins ${TEXT_RULES.description.min} caractères.`)
  }
  if (region.length > TEXT_RULES.region.max) {
    errors.push("La région est trop longue.")
  }
  if (!isCategory(categoryRaw)) {
    errors.push("Catégorie invalide.")
  }
  if (!legalAccepted) {
    errors.push("L'avertissement légal doit être accepté.")
  }
  if (identityCommitment && !/^[0-9a-f]{64}$/.test(identityCommitment)) {
    errors.push("Empreinte d'identité invalide.")
  }
  if (identityCommitment && !commitmentSalt) {
    errors.push("Salt manquant.")
  }

  if (files.length > MAX_EVIDENCE_FILES || links.length > MAX_EVIDENCE_FILES) {
    errors.push(`Maximum ${MAX_EVIDENCE_FILES} pièces de preuve par signalement.`)
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Fichier trop volumineux (max 10 Mo) : ${file.name}.`)
    }
    if (!evidenceKindFromMime(file.type)) {
      errors.push(`Type de fichier non autorisé : ${file.name} (${file.type}).`)
    }
  }
  for (const link of links) {
    try {
      const url = new URL(link)
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.push(`Lien invalide : ${link}`)
      }
    } catch {
      errors.push(`Lien invalide : ${link}`)
    }
  }

  // Intégrité : l'empreinte SHA-256 recalculée côté serveur doit correspondre
  // à celle annoncée par le client (vérifiabilité).
  for (const file of files) {
    const declared = clientHashes.find((h) => h.name === file.name)
    if (!declared || !/^[0-9a-f]{64}$/.test(declared.sha256)) {
      errors.push(`Empreinte manquante pour le fichier : ${file.name}.`)
      break
    }
  }

  if (errors.length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  const reportId = randomUUID()
  const reference = await nextReference(prisma)
  const slug = `${slugify(title)}-${randomUUID().slice(0, 6)}`

  const report = await prisma.report.create({
    data: {
      id: reportId,
      slug,
      reference,
      title,
      summary,
      description,
      category: categoryRaw as Category,
      region: region || null,
      legalAccepted,
      legalAcceptedAt: new Date(),
      identityCommitment,
      commitmentSalt,
    },
  })

  const evidenceData: Array<{
    reportId: string
    kind: EvidenceKind
    fileName: string
    mimeType: string
    size: number
    storagePath: string | null
    url: string | null
    checksum: string
  }> = []

  try {
    for (const file of files) {
      const { storagePath, checksum } = await saveEvidenceFile(reportId, file)
      const declared = clientHashes.find((h) => h.name === file.name)!
      if (checksum !== declared.sha256) {
        throw new Error(`Intégrité non vérifiée pour le fichier : ${file.name}`)
      }
      const kind = evidenceKindFromMime(file.type)!
      evidenceData.push({
        reportId,
        kind,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storagePath,
        url: null,
        checksum,
      })
    }

    for (const link of links) {
      evidenceData.push({
        reportId,
        kind: EvidenceKind.LINK,
        fileName: link,
        mimeType: "text/html",
        size: 0,
        storagePath: null,
        url: link,
        checksum: sha256(Buffer.from(link)),
      })
    }

    if (evidenceData.length === 0) {
      throw new Error("Au moins une preuve est requise.")
    }

    await prisma.evidence.createMany({ data: evidenceData })

    return Response.json(
      { ok: true, reference, status: report.status },
      { status: 201 },
    )
  } catch (error) {
    // Rollback : suppression du signalement et des fichiers stockés.
    await prisma.report.delete({ where: { id: reportId } }).catch(() => {})
    await removeEvidenceDir(reportId).catch(() => {})
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement."
    return Response.json({ ok: false, errors: [message] }, { status: 500 })
  }
}