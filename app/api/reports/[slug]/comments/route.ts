import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CommentStatus } from "@/lib/generated/prisma/enums"

interface RouteParams {
  params: Promise<{ slug: string }>
}

const MAX_CONTENT = 500
const MAX_AUTHOR_NAME = 60

async function findPublishedReport(slug: string) {
  return prisma.report.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const report = await findPublishedReport(slug)
  if (!report) {
    return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as { content?: string; authorName?: string }
  const content = typeof body.content === "string" ? body.content.trim() : ""
  const authorName =
    typeof body.authorName === "string" ? body.authorName.trim().slice(0, MAX_AUTHOR_NAME) : ""

  if (content.length === 0) {
    return NextResponse.json({ error: "Le commentaire est vide." }, { status: 400 })
  }
  if (content.length > MAX_CONTENT) {
    return NextResponse.json({ error: "Commentaire trop long (500 caractères max)." }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      reportId: report.id,
      content,
      authorName: authorName || null,
      status: CommentStatus.PENDING,
    },
    select: { id: true, status: true },
  })

  return NextResponse.json(
    { message: "Commentaire soumis — il sera publié après validation par la modération.", comment },
    { status: 201 }
  )
}