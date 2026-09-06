import { createHash, randomUUID } from "node:crypto"
import { del, put } from "@vercel/blob"

const BLOB_PREFIX = "evidence"

function extensionFor(fileName: string, mimeType: string): string {
  const fromName = fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
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

/**
 * Téléverse une preuve vers Vercel Blob (accès public) et retourne l'URL publique
 * ainsi que l'empreinte SHA-256 du fichier. Seule l'URL est conservée en base.
 */
export async function saveEvidenceFile(
  reportId: string,
  file: File,
): Promise<{ url: string; checksum: string }> {
  const pathname = `${BLOB_PREFIX}/${reportId}/${randomUUID()}${extensionFor(file.name, file.type)}`

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  })

  const buffer = Buffer.from(await file.arrayBuffer())
  const checksum = sha256(buffer)

  return { url: blob.url, checksum }
}

/** Empreinte SHA-256 d'un buffer. */
export function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex")
}

/** Supprime les preuves téléversées d'un signalement (rollback). */
export async function removeEvidenceBlobs(urls: string[]): Promise<void> {
  if (urls.length === 0) return
  await del(urls)
}
