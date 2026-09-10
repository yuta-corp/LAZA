"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  FileText,
  Film,
  Fingerprint,
  Image as ImageIcon,
  Link2,
  Loader2,
  Mic,
  Paperclip,
  ShieldAlert,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { LegalWarning } from "@/components/legal-warning"
import { computeIdentityCommitment, maskHash, sha256File } from "@/lib/crypto/identity"
import { generatePseudo } from "@/lib/pseudo"
import { getIdentitySalt } from "@/app/actions"
import {
  CATEGORIES,
  evidenceKindFromMime,
  isValidCin,
  isValidDateOfBirth,
  isValidHttpUrl,
  isValidPseudo,
  MAX_EVIDENCE_FILES,
  MAX_FILE_SIZE,
  normalizeCin,
  PSEUDO_RULES,
  TEXT_RULES,
} from "@/lib/validation"
import { CATEGORY_LABELS } from "@/lib/report"
import { Category, EvidenceKind } from "@/lib/generated/prisma/enums"

const REGIONS = [
  "Analamanga",
  "Atsinanana",
  "Vakinankaratra",
  "Haute Matsiatra",
  "Boeny",
  "Diana",
  "Sava",
  "Sofia",
  "Itasy",
  "Bongolava",
  "Alaotra-Mangoro",
  "Analanjirofo",
  "Betsiboka",
  "Melaky",
  "Menabe",
  "Atsimo-Andrefana",
  "Anosy",
  "Androy",
  "Atsimo-Atsinanana",
  "Ihorombe",
  "Amoron'i Mania",
  "Vatovavy",
  "Fitovinany",
]

const STEPS = ["Détails", "Preuves", "Identité", "Légal"] as const

const KIND_ICONS: Record<EvidenceKind, typeof FileText> = {
  [EvidenceKind.DOCUMENT]: FileText,
  [EvidenceKind.IMAGE]: ImageIcon,
  [EvidenceKind.VIDEO]: Film,
  [EvidenceKind.AUDIO]: Mic,
  [EvidenceKind.LINK]: Link2,
}

interface EvidenceFile {
  file: File
  hash: string
  kind: EvidenceKind
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "lien"
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function ReportForm() {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Étape 1 — détails
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const [region, setRegion] = useState("")

  // Étape 2 — preuves
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [linkDraft, setLinkDraft] = useState("")

  // Étape 3 — identité
  const [cin, setCin] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [pseudo, setPseudo] = useState("")
  const [commitment, setCommitment] = useState<{ hash: string; salt: string } | null>(null)
  const [computing, setComputing] = useState(false)

  // Étape 4 — légal
  const [legalAccepted, setLegalAccepted] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<{ reference: string } | null>(null)

  function validateStep(current: number): boolean {
    setError(null)
    switch (current) {
      case 0:
        if (title.length < TEXT_RULES.title.min) {
          setError(`Le titre doit contenir au moins ${TEXT_RULES.title.min} caractères.`)
          return false
        }
        if (summary.length < TEXT_RULES.summary.min) {
          setError(`Le résumé doit contenir au moins ${TEXT_RULES.summary.min} caractères.`)
          return false
        }
        if (description.length < TEXT_RULES.description.min) {
          setError(`La description doit contenir au moins ${TEXT_RULES.description.min} caractères.`)
          return false
        }
        if (!category) {
          setError("Veuillez choisir une catégorie.")
          return false
        }
        return true
      case 1:
        if (files.length + links.length === 0) {
          setError("Au moins une pièce de preuve est requise (fichier ou lien).")
          return false
        }
        return true
      case 2:
        if (!isValidPseudo(pseudo)) {
          setError(`Pseudo invalide (${PSEUDO_RULES.min} à ${PSEUDO_RULES.max} caractères, espaces internes tolérés).`)
          return false
        }
        if (!isValidCin(cin)) {
          setError("Numéro CIN invalide (10 à 14 chiffres).")
          return false
        }
        if (!isValidDateOfBirth(birthDate)) {
          setError("Date de naissance invalide.")
          return false
        }
        if (!commitment) {
          setError("Générez d'abord votre empreinte d'identité.")
          return false
        }
        return true
      case 3:
        if (!legalAccepted) {
          setError("Vous devez accepter l'avertissement légal pour envoyer votre signalement.")
          return false
        }
        return true
    }
    return true
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  function back() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleFiles(list: FileList | null) {
    if (!list) return
    for (const file of Array.from(list)) {
      if (files.length + links.length >= MAX_EVIDENCE_FILES) {
        toast.error(`Maximum ${MAX_EVIDENCE_FILES} pièces de preuve par signalement.`)
        break
      }
      const kind = evidenceKindFromMime(file.type)
      if (!kind) {
        toast.error(`Type de fichier non autorisé : ${file.name}`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Fichier trop volumineux (max 10 Mo) : ${file.name}`)
        continue
      }
      const hash = await sha256File(file)
      setFiles((prev) => [...prev, { file, hash, kind }])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function addLink() {
    const url = linkDraft.trim()
    if (!url) return
    if (!isValidHttpUrl(url)) {
      toast.error("Lien invalide — il doit commencer par http:// ou https://")
      return
    }
    if (files.length + links.length >= MAX_EVIDENCE_FILES) {
      toast.error(`Maximum ${MAX_EVIDENCE_FILES} pièces de preuve par signalement.`)
      return
    }
    setLinks((prev) => [...prev, url])
    setLinkDraft("")
  }

  async function generateCommitment() {
    if (!isValidCin(cin)) {
      setError("Numéro CIN invalide (10 à 14 chiffres).")
      return
    }
    if (!isValidDateOfBirth(birthDate)) {
      setError("Date de naissance invalide.")
      return
    }
    setError(null)
    setComputing(true)
    try {
      const { salt } = await getIdentitySalt()
      const hash = await computeIdentityCommitment(normalizeCin(cin), birthDate, salt)
      setCommitment({ hash, salt })
      toast.success("Empreinte d'identité générée sur cet appareil.")
    } catch {
      setError("Impossible de générer l'empreinte. Réessayez.")
    } finally {
      setComputing(false)
    }
  }

  function surprisePseudo() {
    const next = generatePseudo()
    setPseudo(next)
    setCommitment(null)
  }

  async function handleSubmit() {
    if (!validateStep(3) || !commitment) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("summary", summary)
      formData.append("description", description)
      formData.append("category", category ?? "")
      formData.append("region", region)
      formData.append("legalAccepted", String(legalAccepted))
      formData.append("pseudo", pseudo.trim())
      formData.append("identityCommitment", commitment.hash)
      formData.append("commitmentSalt", commitment.salt)
      formData.append("links", JSON.stringify(links))
      formData.append(
        "evidenceHashes",
        JSON.stringify(files.map((f) => ({ name: f.file.name, sha256: f.hash }))),
      )
      for (const f of files) {
        formData.append("evidence", f.file)
      }

      const res = await fetch("/api/reports", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.ok) {
        setSubmitted({ reference: data.reference })
        toast.success("Signalement envoyé.")
      } else {
        const firstError = data.errors?.[0] ?? "Une erreur est survenue."
        setError(firstError)
        toast.error(firstError)
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion puis réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <CircleCheck className="mx-auto size-12 text-emerald-600 dark:text-emerald-400" />
        <h2 className="mt-4 text-xl font-semibold">Signalement reçu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre signalement est en cours de vérification par notre équipe de modération.
        </p>
        <p className="mt-4 font-mono text-sm">
          Référence : <span className="font-semibold">{submitted.reference}</span>
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-muted-foreground">
          <li>1. Un modérateur examine les preuves (généralement sous 48 h).</li>
          <li>2. Si les preuves sont solides, le signalement est publié anonymement.</li>
          <li>3. Vous pouvez ensuite le partager sur les réseaux sociaux.</li>
        </ol>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/fil" />}>
            Retour au fil
          </Button>
          <Button onClick={() => window.location.reload()}>Signaler un autre fait</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Étape {step + 1} / {STEPS.length} — {STEPS[step]}
          </span>
          <span className="text-muted-foreground">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      {error && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du signalement *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Marché public surévalué pour la construction d'un pont"
              maxLength={TEXT_RULES.title.max}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/{TEXT_RULES.title.max} caractères — soyez factuel et précis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Région</Label>
              <Input
                id="region"
                list="regions-list"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex. Analamanga"
              />
              <datalist id="regions-list">
                {REGIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Résumé *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="En 2-3 phrases, l'essentiel du fait signalé."
              rows={3}
              maxLength={TEXT_RULES.summary.max}
            />
            <p className="text-xs text-muted-foreground">
              {summary.length}/{TEXT_RULES.summary.max} — ce texte apparaîtra sur la carte publique.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexte, faits, dates, lieux, personnes concernées, montants… Soyez aussi précis que possible : cela aide la modération à vérifier."
              rows={8}
              maxLength={TEXT_RULES.description.max}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Alert>
            <Paperclip />
            <AlertTitle className="font-semibold">Les preuves sont obligatoires</AlertTitle>
            <AlertDescription>
              Un signalement sans preuve ne peut pas être publié. Documents, photos, captures
              d&apos;écran, vidéos, audio ou liens vers des sources publiques (max{" "}
              {MAX_EVIDENCE_FILES} éléments, 10 Mo par fichier).
            </AlertDescription>
          </Alert>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
          >
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Glissez vos fichiers ici ou cliquez pour parcourir</p>
            <p className="text-xs text-muted-foreground">
              PDF, images, vidéos, audio — l&apos;empreinte SHA-256 de chaque fichier est calculée
              sur votre appareil.
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map(({ file, hash, kind }) => {
                const Icon = KIND_ICONS[kind]
                return (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center gap-3 rounded-lg border p-2.5 text-sm"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        SHA-256 : {maskHash(hash)} · {formatSize(file.size)}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Retirer ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((f) => f.file !== file))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="link">Ou ajouter un lien vers une source publique</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addLink()
                  }
                }}
                placeholder="https://…"
              />
              <Button type="button" variant="outline" onClick={addLink}>
                Ajouter
              </Button>
            </div>
            {links.length > 0 && (
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm">
                    <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{link}</span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Retirer le lien"
                      onClick={() => setLinks((prev) => prev.filter((l) => l !== link))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Alert>
            <Fingerprint />
            <AlertTitle className="font-semibold">Votre identité reste anonyme</AlertTitle>
            <AlertDescription>
              Laza n&apos;enregistre <strong>jamais</strong> votre numéro CIN. Une empreinte
              cryptographique (SHA-256) est calculée sur votre appareil : c&apos;est elle qui est
              stockée. Elle ne peut être levée qu&apos;en cas de dénonciation abusive avérée, sur
              réquisition judiciaire (partage de clés avec la CMIL et la Justice).
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="pseudo">Votre pseudo public *</Label>
            <div className="flex gap-2">
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => {
                  setPseudo(e.target.value)
                  setCommitment(null)
                }}
                maxLength={PSEUDO_RULES.max}
                placeholder="Ex. Ravinala42"
              />
              <Button
                type="button"
                variant="outline"
                onClick={surprisePseudo}
                aria-label="Générer un pseudo au hasard"
                title="Pas d'inspiration ? Laissez la chance choisir."
                className="shrink-0"
              >
                <Shuffle className="size-4" />
                Surprendre
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {pseudo.length}/{PSEUDO_RULES.max} — ce pseudo sera affiché publiquement avec votre
              signalement, sans jamais révéler votre identité.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cin">Numéro CIN *</Label>
              <Input
                id="cin"
                inputMode="numeric"
                value={cin}
                onChange={(e) => {
                  setCin(e.target.value)
                  setCommitment(null)
                }}
                placeholder="Ex. 101 014 123 456"
              />
              <p className="text-xs text-muted-foreground">10 à 14 chiffres — espaces tolérés.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value)
                  setCommitment(null)
                }}
              />
            </div>
          </div>

          <Button type="button" variant="outline" onClick={generateCommitment} disabled={computing}>
            {computing ? <Loader2 className="size-4 animate-spin" /> : <Fingerprint className="size-4" />}
            {computing ? "Calcul en cours…" : "Générer mon empreinte d'identité"}
          </Button>

          {commitment && (
            <Alert>
              <CircleCheck />
              <AlertTitle className="font-semibold">Empreinte calculée sur votre appareil</AlertTitle>
              <AlertDescription className="font-mono break-all text-xs">
                {commitment.hash}
                <span className="mt-1 block font-sans text-xs text-muted-foreground">
                  Seule cette empreinte sera envoyée au serveur. Votre CIN et votre date de
                  naissance ne quittent pas cet appareil.
                </span>
                <span className="mt-2 block font-sans text-xs text-foreground">
                  ✅ Pseudo retenu :{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    @{pseudo.trim() || "—"}
                  </span>{" "}
                  — il sera affiché publiquement avec ce signalement.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <LegalWarning />

          <label className="flex items-start gap-3 rounded-lg border p-4">
            <input
              type="checkbox"
              checked={legalAccepted}
              onChange={(e) => setLegalAccepted(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span className="text-sm leading-relaxed">
              Je certifie que les faits que je signale sont <strong>vrais et de bonne foi</strong>,
              que les preuves fournies sont authentiques, et que je ne cherche pas à nuire. Je
              comprends que la dénonciation abusive est punie par l&apos;article 373.1 du Code pénal
              malgache (6 mois à 5 ans d&apos;emprisonnement, amende de 1 à 10 millions d&apos;Ariary),
              et que mon identité peut être levée sur réquisition judiciaire.
            </span>
          </label>

          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Récapitulatif</p>
            <ul className="mt-2 space-y-1">
              <li>
                <strong>{title || "—"}</strong> · {category ? CATEGORY_LABELS[category] : "—"}
                {region ? ` · ${region}` : ""}
              </li>
              <li>{files.length} fichier(s) + {links.length} lien(s) de preuve</li>
              <li>
                Identité : empreinte cryptographique (anonyme, levable sur réquisition) — publié
                sous le pseudo <strong>{pseudo.trim() || "—"}</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
          <ArrowLeft className="size-4" />
          Retour
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continuer
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
            {submitting ? "Envoi en cours…" : "Envoyer le signalement"}
          </Button>
        )}
      </div>
    </div>
  )
}