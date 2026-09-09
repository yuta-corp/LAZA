"use client"

import { getIdentitySalt } from "@/app/actions"
import { FINGERPRINT_COOKIE, FINGERPRINT_SALT_COOKIE } from "@/lib/constants"

/**
 * Empreinte d'identité persistante côté navigateur (cookie).
 * L'authentification de base du site public repose sur SHA-256 + salt :
 * le serveur ne reçoit jamais le secret local, uniquement le hash ;
 * le salt utilisé pour dériver le hash est conservé pour la correspondance.
 */

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function isSha256(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value)
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
  return match ? match[1] : null
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

/**
 * Récupère l'empreinte SHA-256 du visiteur, en la créant si besoin :
 * sha256(secretLocal | salt) — le secret local généré ne quitte jamais le
 * navigateur, le salt provient du serveur.
 */
export async function ensureShaFingerprint(): Promise<string> {
  const existing = readCookie(FINGERPRINT_COOKIE)
  if (existing && isSha256(existing)) return existing

  const { salt } = await getIdentitySalt()
  const secret = crypto.randomUUID()
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${secret}|${salt}`),
  )
  const hash = toHex(digest)
  writeCookie(FINGERPRINT_COOKIE, hash)
  writeCookie(FINGERPRINT_SALT_COOKIE, salt)
  return hash
}