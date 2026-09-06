"use client"

/**
 * Outils cryptographiques côté navigateur (Web Crypto API).
 * Les calculs restent sur la machine de l'utilisateur : le serveur ne reçoit
 * jamais le numéro CIN ni le fichier brut non haché (le fichier lui, est envoyé).
 */

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Engagement d'identité : sha256(CIN | date de naissance | salt).
 * Uniquement ce hash est transmis au serveur.
 */
export async function computeIdentityCommitment(
  cin: string,
  birthDate: string,
  salt: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${cin}|${birthDate}|${salt}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return toHex(digest)
}

/** Empreinte SHA-256 d'un fichier (intégrité de la preuve). */
export async function sha256File(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  return toHex(digest)
}

/** Masque un hash pour l'affichage : les 14 premiers caractères. */
export function maskHash(hash: string): string {
  return `${hash.slice(0, 14)}…`
}