import { randomBytes } from "node:crypto"

/**
 * Salt jetable pour l'engagement d'identité.
 * Le client calcule sha256(CIN | date de naissance | salt) localement :
 * seul le hash est transmis, jamais le numéro CIN.
 */
export async function GET() {
  const salt = randomBytes(24).toString("hex")
  return Response.json({ salt })
}