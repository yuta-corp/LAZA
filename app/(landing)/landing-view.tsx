"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  FileText,
  Lock,
  Megaphone,
  Paperclip,
  PenLine,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Category } from "@/lib/generated/prisma/enums"

export interface LandingStats {
  published: number
  evidence: number
  support: number
}

export interface LandingTeaser {
  slug: string
  title: string
  summary: string
  category: Category
  region: string | null
  evidenceCount: number
  /** Temps relatif déjà calculé, dans les deux langues (rendu déterministe). */
  time: { fr: string; mg: string }
}

interface LandingViewProps {
  stats: LandingStats
  teaser: LandingTeaser | null
}

const STEP_ICONS = [PenLine, Paperclip, SearchCheck, Megaphone]
const TRUST_ICONS = [ShieldCheck, Smartphone, Lock, Users]

/**
 * Contenu de la landing page, en français simple et en malgache.
 *
 * Structure suivie (guide « anatomy of a landing page ») : titre, sous-titre,
 * CTA + rassurance, comment ça marche, confiance, avantages, preuve sociale
 * (chiffres réels uniquement), FAQ, CTA final. Aucune distraction : une seule
 * offre — déposer un signalement.
 */
export function LandingView({ stats, teaser }: LandingViewProps) {
  const { t, lang } = useLanguage()

  return (
    <>
      {/* ============================== 1-3. HERO ============================== */}
      <section className="border-b border-hairline bg-white">
        <div className="mx-auto grid max-w-[72rem] grid-cols-1 items-center gap-12 px-5 py-12 lg:grid-cols-12 lg:gap-10 lg:px-6 lg:py-20">
          <div className="lg:col-span-7">
            <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
              {t.hero.kicker}
            </span>

            <h1 className="mt-4 font-newsreader text-[34px] font-medium leading-[1.08em] tracking-[-0.015em] text-ink sm:text-[44px] lg:text-[52px]">
              {t.hero.title} <span className="text-teal-deep">{t.hero.titleStrong}</span>{" "}
              <em className="font-normal italic">{t.hero.titleAccent}</em>
            </h1>

            <p className="mt-5 max-w-xl text-[18px] leading-[1.55em] text-ink-muted lg:text-[19px]">
              {t.hero.subtitle}
            </p>

            <div className="mt-8">
              <Link
                href="/signaler"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal-deep px-8 text-[18px] font-semibold text-white shadow-lg shadow-teal-deep/20 transition-colors hover:bg-teal-mid sm:w-auto"
              >
                {t.hero.cta}
                <ArrowRight className="size-5" />
              </Link>
              <p className="mt-3 text-[15px] font-medium text-ink">{t.hero.ctaNote}</p>
            </div>

            <p className="mt-6 flex items-start gap-2 text-[15px] leading-[1.5em] text-ink-muted">
              <Lock className="mt-0.5 size-4 shrink-0 text-secure" />
              {t.hero.reassure}
            </p>

            <Link
              href="/fil"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-teal-deep underline-offset-4 hover:underline"
            >
              {t.hero.secondary}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Visuel : un dossier réel, jamais un faux témoignage. */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-ink">
                {teaser ? t.hero.previewTitle : t.hero.previewEmptyTitle}
              </span>

              {teaser ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-ink">
                    <span className="rounded-md bg-white px-2 py-0.5 font-medium text-ink">
                      {t.form.categories[teaser.category]}
                    </span>
                    {teaser.region ? <span>{teaser.region}</span> : null}
                    <span>·</span>
                    <span>{teaser.time[lang]}</span>
                  </div>

                  <h2 className="mt-3 font-newsreader text-[21px] font-semibold leading-[1.25em] text-ink">
                    {teaser.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-[1.5em] text-ink-muted">
                    {teaser.summary}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secure">
                      <BadgeCheck className="size-4" />
                      {teaser.evidenceCount} <Paperclip className="size-3.5" />
                    </span>
                    <Link
                      href={`/signalement/${teaser.slug}`}
                      className="inline-flex items-center gap-1 text-[14px] font-semibold text-teal-deep hover:text-teal-mid"
                    >
                      {t.hero.read}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  <p className="mt-3 text-[13px] italic text-muted-ink">{t.hero.previewNote}</p>
                </>
              ) : (
                <p className="mt-3 text-[15px] leading-[1.55em] text-ink-muted">
                  {t.hero.previewEmptyBody}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== 4. COMMENT ÇA MARCHE ============================== */}
      <section id="comment-ca-marche" className="scroll-mt-20 border-b border-hairline bg-paper py-14 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <Eyebrow>{t.how.eyebrow}</Eyebrow>
          <h2 className="font-newsreader text-[28px] font-medium leading-[1.15em] tracking-[-0.01em] text-ink lg:text-[36px]">
            {t.how.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-[1.55em] text-ink-muted">{t.how.intro}</p>

          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.how.steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? PenLine
              return (
                <li key={step.title} className="rounded-xl border border-hairline bg-white p-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
                    {index + 1}
                  </p>
                  <h3 className="mt-1 font-newsreader text-[19px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.5em] text-ink-muted">{step.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ============================== 5. CONFIANCE ============================== */}
      <section id="confiance" className="scroll-mt-20 border-b border-hairline bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <Eyebrow>{t.trust.eyebrow}</Eyebrow>
          <h2 className="font-newsreader text-[28px] font-medium leading-[1.15em] tracking-[-0.01em] text-ink lg:text-[36px]">
            {t.trust.title}
          </h2>

          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {t.trust.items.map((item, index) => {
              const Icon = TRUST_ICONS[index] ?? ShieldCheck
              return (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[15px] leading-[1.55em] text-ink-muted">{item.body}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ============================== 6. AVANTAGES ============================== */}
      <section className="border-b border-hairline bg-canvas-tint py-14 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Eyebrow>{t.benefits.eyebrow}</Eyebrow>
              <h2 className="font-newsreader text-[28px] font-medium leading-[1.15em] tracking-[-0.01em] text-ink lg:text-[36px]">
                {t.benefits.title}
              </h2>
            </div>
            <ul className="space-y-4 lg:col-span-7">
              {t.benefits.items.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl bg-white p-4">
                  <Check className="mt-0.5 size-5 shrink-0 text-secure" />
                  <span className="text-[16px] leading-[1.55em] text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================== 7. PREUVE SOCIALE ============================== */}
      <section id="preuve" className="scroll-mt-20 border-b border-hairline bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <Eyebrow>{t.proof.eyebrow}</Eyebrow>
          <h2 className="font-newsreader text-[28px] font-medium leading-[1.15em] tracking-[-0.01em] text-ink lg:text-[36px]">
            {t.proof.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-[1.55em] text-ink-muted">{t.proof.intro}</p>

          {stats.published > 0 ? (
            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label={t.proof.statReports} value={stats.published} />
              <Stat label={t.proof.statEvidence} value={stats.evidence} />
              <Stat label={t.proof.statSupport} value={stats.support} />
            </dl>
          ) : (
            <div className="mt-8 rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
              <p className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                <FileText className="size-5 text-teal-deep" />
                {t.proof.emptyTitle}
              </p>
              <p className="mt-2 text-[15px] leading-[1.55em] text-ink-muted">{t.proof.emptyBody}</p>
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-ink">
              {t.proof.processTitle}
            </h3>
            <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {t.proof.process.map((step, index) => (
                <li key={step.title} className="rounded-xl bg-paper p-5">
                  <span className="font-newsreader text-[24px] font-light text-muted-ink/50">
                    {index + 1}
                  </span>
                  <h4 className="mt-2 text-[16px] font-semibold text-ink">{step.title}</h4>
                  <p className="mt-1 text-[15px] leading-[1.5em] text-ink-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================== 8. FAQ ============================== */}
      <section id="faq" className="scroll-mt-20 border-b border-hairline bg-paper py-14 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <Eyebrow>{t.faq.eyebrow}</Eyebrow>
          <h2 className="font-newsreader text-[28px] font-medium leading-[1.15em] tracking-[-0.01em] text-ink lg:text-[36px]">
            {t.faq.title}
          </h2>

          <div className="mt-8 max-w-3xl divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[22px] font-light leading-none text-teal-deep transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[16px] leading-[1.6em] text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== 9. CTA FINAL ============================== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[72rem] px-5 lg:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[46px]">
              {t.finalCta.title}
            </h2>
            <p className="mt-3 text-[18px] leading-[1.55em] text-ink-muted">{t.finalCta.body}</p>

            <Link
              href="/signaler"
              className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal-deep px-8 text-[18px] font-semibold text-white shadow-lg shadow-teal-deep/20 transition-colors hover:bg-teal-mid sm:w-auto"
            >
              {t.finalCta.cta}
              <ArrowRight className="size-5" />
            </Link>
            <p className="mt-3 text-[15px] font-medium text-ink">{t.finalCta.note}</p>

            <Link
              href="/fil"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-teal-deep underline-offset-4 hover:underline"
            >
              {t.finalCta.secondary}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
      {children}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse rounded-xl bg-paper p-5">
      <dt className="mt-2 text-[14px] text-ink-muted">{label}</dt>
      <dd className="font-newsreader text-[34px] font-semibold leading-none text-ink">
        {new Intl.NumberFormat("fr-FR").format(value)}
      </dd>
    </div>
  )
}
