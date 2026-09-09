"use client"

import { useState } from "react"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDateFr } from "@/lib/report"

interface PublishedComment {
  id: string
  authorName: string | null
  content: string
  createdAt: Date
}

interface CommentSectionProps {
  slug: string
  comments: PublishedComment[]
}

export function CommentSection({ slug, comments }: CommentSectionProps) {
  const [authorName, setAuthorName] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (content.trim().length === 0 || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/reports/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorName }),
      })
      const data = (await res.json()) as { error?: string; message?: string }
      if (!res.ok) {
        toast.error(data.error ?? "Impossible d'envoyer le commentaire.")
        return
      }
      toast.success(data.message ?? "Commentaire soumis.")
      setContent("")
      setAuthorName("")
    } catch {
      toast.error("Erreur réseau — réessayez.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div id="commentaires" className="scroll-mt-16">
      <div className="flex items-center gap-2 px-4 py-3">
        <MessageSquare className="size-4 text-accent" />
        <h2 className="text-base font-semibold">
          Commentaires{" "}
          <span className="font-normal text-muted-foreground">({comments.length})</span>
        </h2>
      </div>

      {/* Fil de commentaires publiés */}
      {comments.length > 0 && (
        <ul className="border-t border-border">
          {comments.map((comment) => (
            <li key={comment.id} className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{comment.authorName ?? "Anonyme"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateFr(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Formulaire de commentaire — pré-modéré */}
      <form onSubmit={submit} className="space-y-3 border-t border-border p-4">
        <div className="min-h-0 flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            required
            placeholder="Apporter un écho, une précision, une information complémentaire… (pré-modéré)"
            className="min-h-24 resize-none bg-background"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{content.length}/500</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={60}
            placeholder="Pseudo (optionnel — affiché « Anonyme »)"
            className="max-w-56 bg-background"
          />
          <Button type="submit" disabled={sending || content.trim().length === 0}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  )
}