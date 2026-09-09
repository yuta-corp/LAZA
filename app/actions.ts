"use server"

import { randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { FINGERPRINT_COOKIE, FINGERPRINT_SALT_COOKIE } from "@/lib/constants"
import { CommentStatus } from "@/lib/generated/prisma/enums"
import { isValidPseudo } from "@/lib/validation"

const MAX_CONTENT = 500

/**
 * Salt d'identité (auth de base SHA + salt).
 * Le client calcule sha256(secret | salt) localement : seul le hash est
 * transmis. Utilisé pour l'empreinte du pseudo et l'engagement du signalement.
 */
export async function getIdentitySalt(): Promise<{ salt: string }> {
  return { salt: randomBytes(24).toString("hex") }
}

async function fingerprintFromCookies(): Promise<{ hash: string; salt: string } | null> {
  const cookieStore = await cookies()
  const hash = cookieStore.get(FINGERPRINT_COOKIE)?.value
  const salt = cookieStore.get(FINGERPRINT_SALT_COOKIE)?.value
  if (!hash || !salt) return null
  return { hash, salt }
}

/** Identité publique du visiteur courant (liée à son empreinte cookie). */
export async function getPublicIdentity(): Promise<{
  identity: { pseudo: string } | null
}> {
  const fp = await fingerprintFromCookies()
  if (!fp) return { identity: null }
  const identity = await prisma.identity.findUnique({
    where: { fingerprint: fp.hash },
    select: { pseudo: true },
  })
  return { identity: identity ?? null }
}

/** Enregistre le pseudo choisi, lié de façon stable à l'empreinte du visiteur. */
export async function registerPseudo(
  pseudo: string,
): Promise<{ ok: true; identity: { pseudo: string } } | { ok: false; error: string }> {
  const fp = await fingerprintFromCookies()
  if (!fp) {
    return { ok: false, error: "Empreinte d'identité manquante. Rafraîchissez la page." }
  }

  const normalized = pseudo.trim()
  if (!isValidPseudo(normalized)) {
    return { ok: false, error: "Pseudo invalide (2 à 24 caractères)." }
  }

  const existing = await prisma.identity.findUnique({ where: { fingerprint: fp.hash } })
  if (existing) {
    if (existing.pseudo === normalized) {
      return { ok: true, identity: { pseudo: normalized } }
    }
    try {
      const updated = await prisma.identity.update({
        where: { id: existing.id },
        data: { pseudo: normalized },
        select: { pseudo: true },
      })
      return { ok: true, identity: { pseudo: updated.pseudo } }
    } catch {
      return { ok: false, error: "Ce pseudo est déjà utilisé, choisissez-en un autre." }
    }
  }

  try {
    const created = await prisma.identity.create({
      data: { fingerprint: fp.hash, salt: fp.salt, pseudo: normalized },
      select: { pseudo: true },
    })
    return { ok: true, identity: { pseudo: created.pseudo } }
  } catch {
    return { ok: false, error: "Ce pseudo est déjà utilisé, choisissez-en un autre." }
  }
}

/**
 * Soumet un commentaire (pré-modéré). Réservé aux visiteurs ayant enregistré
 * leur pseudo : l'auteur est le pseudo lié à l'empreinte (cookie).
 */
export async function submitComment(
  slug: string,
  content: string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const report = await prisma.report.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  })
  if (!report) {
    return { ok: false, error: "Signalement introuvable." }
  }

  const fp = await fingerprintFromCookies()
  if (!fp) {
    return { ok: false, error: "Empreinte d'identité manquante. Rafraîchissez la page." }
  }
  const identity = await prisma.identity.findUnique({
    where: { fingerprint: fp.hash },
    select: { id: true, pseudo: true },
  })
  if (!identity) {
    return { ok: false, error: "Choisissez d'abord votre pseudo pour commenter." }
  }

  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: "Le commentaire est vide." }
  }
  if (trimmed.length > MAX_CONTENT) {
    return { ok: false, error: "Commentaire trop long (500 caractères max)." }
  }

  await prisma.comment.create({
    data: {
      reportId: report.id,
      identityId: identity.id,
      authorName: identity.pseudo,
      content: trimmed,
      status: CommentStatus.PENDING,
    },
    select: { id: true }, // only used for the side effect; id ignored
  })

  return {
    ok: true,
    message: "Commentaire soumis — il sera publié après validation par la modération.",
  }
}

/** Active ou retire le soutien (like) du visiteur courant sur un signalement. */
export async function toggleLike(
  slug: string,
  liked: boolean,
): Promise<{ ok: true; liked: boolean; count: number } | { ok: false; error: string }> {
  const report = await prisma.report.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  })
  if (!report) {
    return { ok: false, error: "Signalement introuvable." }
  }

  const fp = await fingerprintFromCookies()
  if (!fp) {
    return { ok: false, error: "Empreinte d'identité manquante. Rafraîchissez la page." }
  }

  if (liked) {
    await prisma.reportLike.upsert({
      where: { reportId_fingerprint: { reportId: report.id, fingerprint: fp.hash } },
      create: { reportId: report.id, fingerprint: fp.hash },
      update: {},
    })
  } else {
    await prisma.reportLike.deleteMany({
      where: { reportId: report.id, fingerprint: fp.hash },
    })
  }

  const count = await prisma.reportLike.count({ where: { reportId: report.id } })
  return { ok: true, liked, count }
}