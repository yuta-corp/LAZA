import { isValidPseudo } from "@/lib/validation"

/**
 * Génération de pseudo public (client). Liste de mots d'inspiration malgache,
 * sûre et courte ; un nombre aléatoire est ajouté pour la rareté.
 * L'unicité n'est pas garantie côté client : c'est le serveur qui tranche.
 */

const NOUNS = [
  "Ravinala",
  "Masina",
  "Tsiory",
  "Lokanga",
  "Vonjy",
  "Sambatra",
  "Masoandro",
  "Varatra",
  "Tantara",
  "Aloalo",
  "Fariky",
  "Kintana",
  "Ranoma",
  "Sokina",
  "Vahiny",
  "Lanto",
  "Manda",
  "Nofy",
  "Hazo",
  "Rano",
] as const

const TITLES = [
  "Viry",
  "Salama",
  "Maraina",
  "Lalana",
  "Fandriana",
  "Sainte",
  "Veloma",
  "Mahitsy",
  "Lovania",
  "Kimbuta",
] as const

function randomIndex(len: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % len
}

/** Retourne un pseudo aléatoire valide (ex. « Ravinala42 »). */
export function generatePseudo(): string {
  const base = randomIndex(2) === 0 ? NOUNS[randomIndex(NOUNS.length)] : TITLES[randomIndex(TITLES.length)]
  const number = 10 + randomIndex(90)
  const candidate = `${base}${number}`
  return isValidPseudo(candidate) ? candidate : `Laza${number}`
}