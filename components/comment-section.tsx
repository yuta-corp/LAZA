"use client"

import { useCallback, useState } from "react"
import { Loader2, MessageSquare, Send, UserPen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDateFr } from "@/lib/report"
import { PSEUDO_RULES } from "@/lib/validation"
import { registerPseudo, submitComment } from "@/app/actions"
import { ensureShaFingerprint } from "@/lib/fingerprint"

interface PublishedComment {
  id: string
  authorName: string | null
  content: string
  createdAt: Date
}

interface CommentSectionProps {
  slug: string
  comments: PublishedComment[]
  initialIdentity: { pseudo: string } | null
}

export function CommentSection({ slug, comments, initialIdentity }: CommentSectionProps) {
  const [identity, setIdentity] = useState<{ pseudo: string } | null>(initialIdentity)
  const [pseudo, setPseudo] = useState(initialIdentity?.pseudo ?? "")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = content.trim()
      if (!trimmed || sending) return

      setSending(true)
      try {
        // L'empreinte (cookie) est créée avant toute action serveur : c'est
        // elle, puis le pseudo, qui identifient l'auteur côté serveur.
        await ensureShaFingerprint()

        if (!identity) {
          const chosen = pseudo.trim()
          if (chosen.length < PSEUDO_RULES.min) {
            toast.error("Choisissez un pseudo pour participer.")
            setSending(false)
            return
          }
          const registered = await registerPseudo(chosen)
          if (!registered.ok) {
            toast.error(registered.error)
            setSending(false)
            return
          }
          setIdentity(registered.identity)
        }

        const result = await submitComment(slug, trimmed)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success(result.message)
        setContent("")
      } catch {
        toast.error("Erreur réseau — réessayez.")
      } finally {
        setSending(false)
      }
    },
    [content, sending, identity, pseudo, slug],
  )

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

        {!identity && (
          <div className="flex items-center gap-2">
            <UserPen className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={PSEUDO_RULES.max}
              required
              placeholder="Choisissez votre pseudo (affiché sur le fil)"
              className="max-w-72 bg-background"
            />
          </div>
        )}
        {identity && (
          <p className="text-xs text-muted-foreground">
            Vous commentez en tant que{" "}
            <span className="font-semibold text-foreground">@{identity.pseudo}</span> — votre
            identité est liée à votre empreinte locale.
          </p>
        )}

        <Button
          type="submit"
          disabled={sending || content.trim().length === 0 || (!identity && pseudo.trim().length < PSEUDO_RULES.min)}
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Envoyer
        </Button>
      </form>
    </div>
  )
}