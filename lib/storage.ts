import { createHash, randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const STORAGE_DIR = process.env.EVIDENCE_STORAGE_DIR ?? "storage/evidence"

function extensionFor(fileName: string, mimeType: string): string {
  const fromName = path.extname(fileName).toLowerCase()
  if (fromName && fromName.length <= 8) {
    return fromName
  }
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
    "application/pdf": ".pdf",
  }
  return byMime[mimeType] ?? ""
}

/** Sauvegarde un fichier de preuve sur disque. Retourne le chemin relatif stocké en base. */
export async function saveEvidenceFile(
  reportId: string,
  file: File,
): Promise<{ storagePath: string; checksum: string }> {
  const dirPath = path.join(process.cwd(), STORAGE_DIR, reportId)
  await mkdir(dirPath, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${randomUUID()}${extensionFor(file.name, file.type)}`
  const absolutePath = path.join(dirPath, fileName)
  await writeFile(absolutePath, buffer)

  const checksum = sha256(buffer)
  return { storagePath: path.join(STORAGE_DIR, reportId, fileName), checksum }
}

/** Empreinte SHA-256 d'un buffer. */
export function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex")
}

/** Supprime le dossier de preuves d'un signalement (rollback). */
export async function removeEvidenceDir(reportId: string): Promise<void> {
  const dirPath = path.join(process.cwd(), STORAGE_DIR, reportId)
  const { rm } = await import("node:fs/promises")
  await rm(dirPath, { recursive: true, force: true })
}