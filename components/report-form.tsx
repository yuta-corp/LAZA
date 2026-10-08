"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Check,
  CircleCheck,
  FileText,
  Film,
  Fingerprint,
  Image as ImageIcon,
  Info,
  Link2,
  Loader2,
  Lock,
  Mic,
  ShieldAlert,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LegalWarning } from "@/components/legal-warning"
import { computeIdentityCommitment, sha256File } from "@/lib/crypto/identity"
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
  TEXT_RULES,
} from "@/lib/validation"
import { deriveSummary, deriveTitle } from "@/lib/report"
import { Category, EvidenceKind } from "@/lib/generated/prisma/enums"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 4
const DRAFT_KEY = "laza_draft_v1"

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

/** Brouillon local : jamais d'identité (CIN, naissance) ni de fichier dedans. */
interface Draft {
  step: number
  story: string
  category: Category | null
  region: string
  pseudo: string
  titleOverride: string | null
  summaryOverride: string | null
  updatedAt: number
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return ""
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/* ------------------------- Brouillon local (localStorage) ------------------------- */

/** Le brouillon proposé est celui présent à l'ouverture de la page : il ne
 * réapparaît pas pendant que la personne remplit le formulaire. */
let draftAtLoad: string | null = null
let draftAtLoadRead = false

function readDraftAtLoad(): string | null {
  if (!draftAtLoadRead) {
    draftAtLoadRead = true
    draftAtLoad = readDraftRaw()
  }
  return draftAtLoad
}

function readDraftRaw(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function getServerDraftRaw(): string | null {
  return null
}

function subscribeNothing(): () => void {
  return () => {}
}

function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Draft
    if (!parsed || typeof parsed.story !== "string") return null
    if (!parsed.story.trim() && !parsed.category && !parsed.pseudo) return null
    return parsed
  } catch {
    return null
  }
}

/** Enregistre le brouillon local sans jamais effacer celui déjà présent. */
function persistDraft(draft: Draft) {
  const hasContent = Boolean(draft.story.trim() || draft.category || draft.pseudo.trim())
  if (!hasContent) return
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Stockage local indisponible (navigation privée) : le parcours reste utilisable.
  }
}

function clearDraft() {
  draftAtLoad = null
  draftAtLoadRead = true
  try {
    window.localStorage.removeItem(DRAFT_KEY)
  } catch {
    // rien à faire : le brouillon n'existait pas
  }
}

/**
 * Parcours de signalement simplifié.
 *
 * Un écran = une question, une barre de progression lisible, des gros boutons,
 * une phrase de réassurance à chaque étape, et un brouillon conservé sur le
 * téléphone pour pouvoir s'arrêter et revenir plus tard.
 */
export function ReportForm() {
  const { t } = useLanguage()

  const [phase, setPhase] = useState<"form" | "review" | "done">("form")
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Étape 1 — le récit
  const [story, setStory] = useState("")

  // Étape 2 — lieu et type
  const [category, setCategory] = useState<Category | null>(null)
  const [region, setRegion] = useState("")

  // Étape 3 — preuves
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [linkDraft, setLinkDraft] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Étape 4 — identité anonyme
  const [pseudo, setPseudo] = useState("")
  const [cin, setCin] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [commitment, setCommitment] = useState<{ hash: string; salt: string } | null>(null)
  const [computing, setComputing] = useState(false)

  // Vérification finale
  const [titleOverride, setTitleOverride] = useState<string | null>(null)
  const [summaryOverride, setSummaryOverride] = useState<string | null>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState<string | null>(null)

  // Brouillon local : lu via useSyncExternalStore (pas de setState dans un effet,
  // pas d'écart entre le rendu serveur et le rendu navigateur).
  const draftRaw = useSyncExternalStore(subscribeNothing, readDraftAtLoad, getServerDraftRaw)
  const [draftDismissed, setDraftDismissed] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const storedDraft = useMemo(() => parseDraft(draftRaw), [draftRaw])
  const pendingDraft = draftDismissed ? null : storedDraft

  const derived = useMemo(
    () => ({ title: deriveTitle(story), summary: deriveSummary(story) }),
    [story],
  )
  const title = titleOverride ?? derived.title
  const summary = summaryOverride ?? derived.summary

  // Sauvegarde continue : rien à cliquer pour ne pas perdre son récit.
  useEffect(() => {
    if (phase !== "form") return
    persistDraft({
      step,
      story,
      category,
      region,
      pseudo,
      titleOverride,
      summaryOverride,
      updatedAt: Date.now(),
    })
  }, [phase, step, story, category, region, pseudo, titleOverride, summaryOverride])

  // Chaque écran repart du haut, comme sur un téléphone.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [step, phase])

  function resumeDraft() {
    if (!pendingDraft) return
    setStory(pendingDraft.story)
    setCategory(pendingDraft.category)
    setRegion(pendingDraft.region)
    setPseudo(pendingDraft.pseudo)
    setTitleOverride(pendingDraft.titleOverride)
    setSummaryOverride(pendingDraft.summaryOverride)
    setStep(Math.min(Math.max(pendingDraft.step, 0), TOTAL_STEPS - 1))
    setDraftDismissed(true)
  }

  function discardDraft() {
    clearDraft()
    setDraftDismissed(true)
    setStep(0)
    setStory("")
    setCategory(null)
    setRegion("")
    setPseudo("")
    setTitleOverride(null)
    setSummaryOverride(null)
  }

  function saveAndLeave() {
    persistDraft({
      step,
      story,
      category,
      region,
      pseudo,
      titleOverride,
      summaryOverride,
      updatedAt: Date.now(),
    })
    setSavedNotice(true)
    toast.success(t.form.saved)
  }

  function validateStep(current: number): string | null {
    if (current === 0) {
      return story.trim().length >= TEXT_RULES.description.min ? null : t.form.step1.error
    }
    if (current === 1) {
      return category ? null : t.form.step2.error
    }
    if (current === 2) {
      return files.length + links.length > 0 ? null : t.form.step3.error
    }
    if (!isValidPseudo(pseudo.trim())) return t.form.errors.pseudo
    if (!isValidCin(cin)) return t.form.errors.cin
    if (!isValidDateOfBirth(birthDate)) return t.form.errors.birth
    if (!commitment) return t.form.errors.commitment
    return null
  }

  function next() {
    const message = validateStep(step)
    if (message) {
      setError(message)
      return
    }
    setError(null)
    if (step === TOTAL_STEPS - 1) {
      setPhase("review")
      return
    }
    setStep((value) => value + 1)
  }

  function back() {
    setError(null)
    if (phase === "review") {
      setPhase("form")
      setStep(TOTAL_STEPS - 1)
      return
    }
    setStep((value) => Math.max(value - 1, 0))
  }

  async function handleFiles(list: FileList | null) {
    if (!list) return
    for (const file of Array.from(list)) {
      if (files.length + links.length >= MAX_EVIDENCE_FILES) {
        toast.error(t.form.files.tooMany)
        break
      }
      const kind = evidenceKindFromMime(file.type)
      if (!kind) {
        toast.error(t.form.files.notAllowed(file.name))
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t.form.files.tooBig(file.name))
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
      toast.error(t.form.files.badLink)
      return
    }
    if (files.length + links.length >= MAX_EVIDENCE_FILES) {
      toast.error(t.form.files.tooMany)
      return
    }
    setLinks((prev) => [...prev, url])
    setLinkDraft("")
  }

  async function generateCommitment() {
    if (!isValidPseudo(pseudo.trim())) {
      setError(t.form.errors.pseudo)
      return
    }
    if (!isValidCin(cin)) {
      setError(t.form.errors.cin)
      return
    }
    if (!isValidDateOfBirth(birthDate)) {
      setError(t.form.errors.birth)
      return
    }
    setError(null)
    setComputing(true)
    try {
      const { salt } = await getIdentitySalt()
      const hash = await computeIdentityCommitment(normalizeCin(cin), birthDate, salt)
      setCommitment({ hash, salt })
      toast.success(t.form.step4.generated)
    } catch {
      setError(t.form.errors.generic)
    } finally {
      setComputing(false)
    }
  }

  function validateReview(): string | null {
    if (title.trim().length < TEXT_RULES.title.min) return t.form.step1.error
    if (summary.trim().length < TEXT_RULES.summary.min) return t.form.review.summaryTooShort
    if (!legalAccepted) return t.form.review.errorLegal
    return null
  }

  async function handleSubmit() {
    const message = validateReview()
    if (message) {
      setError(message)
      return
    }
    if (!commitment || !category) {
      setError(t.form.errors.generic)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("summary", summary.trim())
      formData.append("description", story.trim())
      formData.append("category", category)
      formData.append("region", region.trim())
      formData.append("legalAccepted", "true")
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
        clearDraft()
        setReference(data.reference as string)
        setPhase("done")
        toast.success(t.form.done.title)
      } else {
        const first = data.errors?.[0] ?? t.form.errors.generic
        setError(first)
        toast.error(first)
      }
    } catch {
      setError(t.form.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  /* ------------------------------- Écran de fin ------------------------------- */
  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-6 sm:p-8">
        <CircleCheck className="size-12 text-secure" />
        <h1 className="mt-4 font-newsreader text-[28px] font-semibold leading-tight text-ink">
          {t.form.done.title}
        </h1>
        <p className="mt-2 text-[16px] leading-[1.55em] text-ink-muted">{t.form.done.body}</p>

        <div className="mt-6 rounded-xl bg-paper p-4">
          <p className="text-[13px] font-medium uppercase tracking-wider text-muted-ink">
            {t.form.done.refLabel}
          </p>
          <p className="mt-1 font-mono text-[20px] font-semibold text-ink">{reference}</p>
          <p className="mt-2 text-[15px] leading-[1.5em] text-ink-muted">{t.form.done.refHint}</p>
        </div>

        <h2 className="mt-6 text-[16px] font-semibold text-ink">{t.form.done.nextTitle}</h2>
        <ol className="mt-3 space-y-3">
          {t.form.done.next.map((line, index) => (
            <li key={line} className="flex items-start gap-3 text-[16px] leading-[1.55em] text-ink-muted">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-deep/10 text-[13px] font-semibold text-teal-deep">
                {index + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/fil"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid"
          >
            {t.form.done.seeFeed}
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-[16px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper"
          >
            {t.form.done.again}
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------ Écran de revue ------------------------------ */
  if (phase === "review") {
    return (
      <div className="space-y-5">
        <StepHeader step={TOTAL_STEPS} label={t.form.review.title} />

        {error ? <StepError message={error} /> : null}

        <h1 className="font-newsreader text-[26px] font-semibold leading-tight text-ink">
          {t.form.review.title}
        </h1>
        <p className="text-[16px] leading-[1.55em] text-ink-muted">{t.form.review.hint}</p>

        <Field label={t.form.review.titleLabel} htmlFor="review-title">
          <input
            id="review-title"
            value={title}
            onChange={(event) => setTitleOverride(event.target.value)}
            maxLength={TEXT_RULES.title.max}
            className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[16px] text-ink outline-none focus:border-teal-deep"
          />
        </Field>

        <Field label={t.form.review.summaryLabel} htmlFor="review-summary" hint={t.form.review.summaryHint}>
          <textarea
            id="review-summary"
            value={summary}
            onChange={(event) => setSummaryOverride(event.target.value)}
            maxLength={TEXT_RULES.summary.max}
            rows={4}
            className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[16px] leading-[1.5em] text-ink outline-none focus:border-teal-deep"
          />
        </Field>

        <div className="rounded-xl border border-hairline bg-white p-4 text-[15px]">
          <p className="font-semibold text-ink">{t.form.review.recapEvidence}</p>
          <p className="mt-1 text-ink-muted">
            {t.form.review.recapEvidenceCount(files.length, links.length)}
          </p>
          <p className="mt-3 font-semibold text-ink">{t.form.review.recapIdentity}</p>
          <p className="mt-1 text-ink-muted">@{pseudo.trim()}</p>
        </div>

        <LegalWarning />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-hairline bg-white p-4">
          <input
            type="checkbox"
            checked={legalAccepted}
            onChange={(event) => setLegalAccepted(event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-teal-deep"
          />
          <span className="text-[15px] leading-[1.55em] text-ink">{t.form.review.legalLabel}</span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={back}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[16px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper"
          >
            <ArrowLeft className="size-4" />
            {t.form.back}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <ShieldAlert className="size-5" />}
            {submitting ? t.form.review.sending : t.form.review.send}
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------ Parcours 4 étapes ------------------------------ */
  const hasEvidence = files.length + links.length > 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-newsreader text-[24px] font-semibold leading-tight text-ink sm:text-[28px]">
          {t.form.pageTitle}
        </h1>
        <p className="mt-1 text-[16px] leading-[1.5em] text-ink-muted">{t.form.pageIntro}</p>
      </div>

      {pendingDraft ? (
        <div className="rounded-xl border border-teal-deep/30 bg-white p-4">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <BookmarkCheck className="size-5 shrink-0 text-teal-deep" />
            {t.form.draftBannerTitle}
          </p>
          <p className="mt-1 text-[15px] text-ink-muted">{t.form.draftBannerBody}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resumeDraft}
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-deep px-4 text-[15px] font-semibold text-white transition-colors hover:bg-teal-mid"
            >
              {t.form.draftRestore}
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="inline-flex min-h-11 items-center rounded-xl bg-paper px-4 text-[15px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {t.form.draftDiscard}
            </button>
          </div>
        </div>
      ) : null}

      <ProgressHeader step={step} />

      {error ? <StepError message={error} /> : null}

      {step === 0 ? (
        <div className="space-y-4">
          <StepTitle title={t.form.step1.title} hint={t.form.step1.hint} />

          <Field label={t.form.step1.label} htmlFor="story">
            <textarea
              id="story"
              value={story}
              onChange={(event) => setStory(event.target.value)}
              rows={9}
              maxLength={TEXT_RULES.description.max}
              placeholder={t.form.step1.placeholder}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] leading-[1.55em] text-ink outline-none focus:border-teal-deep"
            />
          </Field>

          <Reassurance text={t.form.step1.reassurance} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <StepTitle title={t.form.step2.title} hint={t.form.step2.hint} />

          <fieldset>
            <legend className="text-[16px] font-semibold text-ink">{t.form.step2.categoryLabel}</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((value) => {
                const active = value === category
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={active}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-[16px] transition-colors",
                      active
                        ? "border-teal-deep bg-teal-deep/10 font-semibold text-ink"
                        : "border-hairline bg-white text-ink hover:border-teal-deep/40",
                    )}
                  >
                    {t.form.categories[value]}
                    {active ? <Check className="size-5 shrink-0 text-teal-deep" /> : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Field label={t.form.step2.regionLabel} htmlFor="region" hint={t.form.step2.regionHint}>
            <input
              id="region"
              list="regions-list"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder={t.form.step2.regionPlaceholder}
              maxLength={TEXT_RULES.region.max}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] text-ink outline-none focus:border-teal-deep"
            />
            <datalist id="regions-list">
              {REGIONS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>

          <Reassurance text={t.form.step2.reassurance} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <StepTitle title={t.form.step3.title} hint={t.form.step3.hint} />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,application/pdf"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-hairline-strong bg-white p-6 text-center transition-colors hover:border-teal-deep/60"
          >
            <Upload className="size-7 text-teal-deep" />
            <span className="text-[17px] font-semibold text-ink">{t.form.step3.addFiles}</span>
            <span className="text-[15px] text-ink-muted">{t.form.step3.dropHint}</span>
            <span className="text-[13px] text-muted-ink">{t.form.step3.limit}</span>
          </button>

          {!hasEvidence ? <p className="text-[15px] text-muted-ink">{t.form.step3.empty}</p> : null}

          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map(({ file, kind }) => {
                const Icon = KIND_ICONS[kind]
                return (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-3"
                  >
                    <Icon className="size-5 shrink-0 text-teal-deep" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-ink">{file.name}</p>
                      <p className="text-[13px] text-muted-ink">
                        {formatSize(file.size)}
                        {file.size > 0 ? " · " : ""}
                        {t.form.step3.fileReady}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Retirer ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((item) => item.file !== file))}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}

          <div>
            <label htmlFor="link" className="text-[16px] font-semibold text-ink">
              {t.form.step3.addLink}
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="link"
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addLink()
                  }
                }}
                placeholder={t.form.step3.linkPlaceholder}
                inputMode="url"
                className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] text-ink outline-none focus:border-teal-deep"
              />
              <button
                type="button"
                onClick={addLink}
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-[16px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper"
              >
                {t.form.step3.linkButton}
              </button>
            </div>
          </div>

          {links.length > 0 ? (
            <ul className="space-y-2">
              {links.map((link) => (
                <li
                  key={link}
                  className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-3"
                >
                  <Link2 className="size-4 shrink-0 text-teal-deep" />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{link}</span>
                  <button
                    type="button"
                    aria-label="Retirer le lien"
                    onClick={() => setLinks((prev) => prev.filter((item) => item !== link))}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <Reassurance text={t.form.step3.reassurance} />

          {!hasEvidence ? (
            <div className="rounded-xl border border-hairline bg-white p-4">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Info className="size-5 shrink-0 text-teal-deep" />
                {t.form.step3.noProofTitle}
              </p>
              <p className="mt-1 text-[15px] leading-[1.5em] text-ink-muted">
                {t.form.step3.noProofBody}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <StepTitle title={t.form.step4.title} hint={t.form.step4.hint} />

          <Field label={t.form.step4.pseudoLabel} htmlFor="pseudo" hint={t.form.step4.pseudoHint}>
            <div className="flex gap-2">
              <input
                id="pseudo"
                value={pseudo}
                onChange={(event) => {
                  setPseudo(event.target.value)
                  setCommitment(null)
                }}
                maxLength={24}
                placeholder="Ravinala42"
                className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] text-ink outline-none focus:border-teal-deep"
              />
              <button
                type="button"
                onClick={() => {
                  setPseudo(generatePseudo())
                  setCommitment(null)
                }}
                className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 text-[15px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper"
              >
                <Shuffle className="size-4" />
                {t.form.step4.surprise}
              </button>
            </div>
          </Field>

          <Field label={t.form.step4.cinLabel} htmlFor="cin" hint={t.form.step4.cinHint}>
            <input
              id="cin"
              inputMode="numeric"
              value={cin}
              onChange={(event) => {
                setCin(event.target.value)
                setCommitment(null)
              }}
              placeholder="101 014 123 456"
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] text-ink outline-none focus:border-teal-deep"
            />
          </Field>

          <Field label={t.form.step4.birthLabel} htmlFor="birth" hint={t.form.step4.birthHint}>
            <input
              id="birth"
              type="date"
              value={birthDate}
              onChange={(event) => {
                setBirthDate(event.target.value)
                setCommitment(null)
              }}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[17px] text-ink outline-none focus:border-teal-deep"
            />
          </Field>

          <button
            type="button"
            onClick={generateCommitment}
            disabled={computing}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-[16px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper disabled:opacity-60"
          >
            {computing ? <Loader2 className="size-5 animate-spin" /> : <Fingerprint className="size-5" />}
            {computing ? t.form.step4.computing : t.form.step4.generate}
          </button>

          {commitment ? (
            <p className="flex items-start gap-2 rounded-xl bg-white p-4 text-[15px] leading-[1.5em] text-ink ring-1 ring-hairline">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-secure" />
              {t.form.step4.generated}
            </p>
          ) : null}

          <Reassurance text={t.form.step4.reassurance} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[16px] font-medium text-ink ring-1 ring-hairline transition-colors hover:bg-paper disabled:invisible"
        >
          <ArrowLeft className="size-4" />
          {t.form.back}
        </button>
        <button
          type="button"
          onClick={next}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid"
        >
          {t.form.next}
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className="pb-4 text-center">
        <button
          type="button"
          onClick={saveAndLeave}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-[15px] font-medium text-teal-deep underline-offset-4 hover:underline"
        >
          <BookmarkCheck className="size-4" />
          {t.form.save}
        </button>
        <p className="mt-1 text-[13px] text-muted-ink">{t.form.savedFilesNote}</p>
        {savedNotice ? <p className="mt-2 text-[14px] font-medium text-secure">{t.form.saved}</p> : null}
      </div>
    </div>
  )
}

/* ------------------------------ Petits éléments ------------------------------ */

function ProgressHeader({ step }: { step: number }) {
  const { t } = useLanguage()
  const label = t.form.progress(step + 1, TOTAL_STEPS)
  return (
    <div>
      <div className="flex items-center justify-between text-[15px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-ink-muted">{t.form.steps[step]}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step + 1}
        aria-label={label}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container"
      >
        <div
          className="h-full rounded-full bg-teal-deep transition-all duration-300"
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  )
}

function StepHeader({ step, label }: { step: number; label: string }) {
  const { t } = useLanguage()
  return (
    <div>
      <div className="flex items-center justify-between text-[15px]">
        <span className="font-semibold text-ink">{t.form.progress(step, TOTAL_STEPS)}</span>
        <span className="text-ink-muted">{label}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container">
        <div className="h-full w-full rounded-full bg-teal-deep" />
      </div>
    </div>
  )
}

function StepTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="font-newsreader text-[26px] font-semibold leading-tight text-ink">{title}</h2>
      <p className="mt-2 text-[16px] leading-[1.55em] text-ink-muted">{hint}</p>
    </div>
  )
}

function StepError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-vermilion/30 bg-vermilion/5 p-4 text-[15px] leading-[1.5em] text-ink"
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-vermilion" />
      {message}
    </p>
  )
}

function Reassurance({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 text-[14px] leading-[1.5em] text-ink-muted">
      <Lock className="mt-0.5 size-4 shrink-0 text-secure" />
      {text}
    </p>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[16px] font-semibold text-ink">
        {label}
      </label>
      {hint ? <p className="mt-1 text-[14px] leading-[1.5em] text-ink-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}
