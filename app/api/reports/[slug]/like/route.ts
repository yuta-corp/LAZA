import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ slug: string }>
}

function isValidFingerprint(fingerprint: unknown): fingerprint is string {
  return typeof fingerprint === "string" && fingerprint.length >= 8 && fingerprint.length <= 128
}

async function findPublishedReport(slug: string) {
  return prisma.report.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  })
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const report = await findPublishedReport(slug)
  if (!report) {
    return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 })
  }

  const fingerprint = req.nextUrl.searchParams.get("fingerprint")
  const [count, liked] = await Promise.all([
    prisma.reportLike.count({ where: { reportId: report.id } }),
    fingerprint && isValidFingerprint(fingerprint)
      ? prisma.reportLike.findUnique({
          where: { reportId_fingerprint: { reportId: report.id, fingerprint } },
          select: { id: true },
        })
      : null,
  ])

  return NextResponse.json({ count, liked: Boolean(liked) })
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const report = await findPublishedReport(slug)
  if (!report) {
    return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as { fingerprint?: string }
  if (!isValidFingerprint(body.fingerprint)) {
    return NextResponse.json({ error: "Empreinte invalide." }, { status: 400 })
  }

  await prisma.reportLike.upsert({
    where: { reportId_fingerprint: { reportId: report.id, fingerprint: body.fingerprint } },
    create: { reportId: report.id, fingerprint: body.fingerprint },
    update: {},
  })

  const count = await prisma.reportLike.count({ where: { reportId: report.id } })
  return NextResponse.json({ liked: true, count })
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const report = await findPublishedReport(slug)
  if (!report) {
    return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as { fingerprint?: string }
  if (!isValidFingerprint(body.fingerprint)) {
    return NextResponse.json({ error: "Empreinte invalide." }, { status: 400 })
  }

  await prisma.reportLike.deleteMany({
    where: { reportId: report.id, fingerprint: body.fingerprint },
  })

  const count = await prisma.reportLike.count({ where: { reportId: report.id } })
  return NextResponse.json({ liked: false, count })
}