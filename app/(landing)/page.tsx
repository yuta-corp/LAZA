import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Database,
  FileText,
  Fingerprint,
  Gavel,
  Globe,
  Info,
  KeyRound,
  Landmark,
  Laptop,
  Lock,
  Megaphone,
  MessageCircle,
  Newspaper,
  Paperclip,
  PenLine,
  Search,
  Server,
  Share2,
  ShieldCheck,
  Terminal,
  ThumbsUp,
  Upload,
  UserCheck,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { LandingReveal } from "@/app/(landing)/landing-reveal"
import { CATEGORY_LABELS, EVIDENCE_LABELS, relativeTimeFr } from "@/lib/report"
import type { Evidence, Report } from "@/lib/generated/prisma/client"

export const metadata: Metadata = {
  title: "Laza — Dénoncer la corruption à Madagascar",
  description:
    "Plateforme de dénonciation anonyme de corruption à Madagascar. Signalez des faits avec des preuves, vérifiés avant publication et partageables sur les réseaux sociaux.",
}

// Métriques et registre ouverts : les chiffres reflètent en direct la base.
export const dynamic = "force-dynamic"

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 inline-block font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
      {children}
    </span>
  )
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-newsreader text-[28px] font-medium leading-[1.2em] tracking-[-0.01em] text-ink lg:text-[38px] ${className}`}
    >
      {children}
    </h2>
  )
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n)
}

/** Tronque un hash d'intégrité pour l'affichage public. */
function shortHash(hash: string): string {
  if (hash.length <= 12) return hash
  return `${hash.slice(0, 4)}…${hash.slice(-8)}`
}

type ReportWithEvidence = Report & { evidence: Evidence[] }

export default async function LandingPage() {
  const [published, evidenceCount, likeCount, commentCount, latest] = await Promise.all([
    prisma.report.count({ where: { status: "PUBLISHED" } }),
    prisma.evidence.count({ where: { report: { status: "PUBLISHED" } } }),
    prisma.reportLike.count(),
    prisma.comment.count({ where: { status: "PUBLISHED" } }),
    prisma.report.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { evidence: true },
    }),
  ])

  const heroReport: ReportWithEvidence | undefined = latest[0]
  const teasers: ReportWithEvidence[] = latest.slice(0, 3)
  const supportCount = likeCount + commentCount

  return (
    <div className="bg-canvas-tint">
      <LandingReveal>
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden border-b border-hairline bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Colonne éditoriale gauche */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <span data-hero className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-deep/10 px-2.5 py-1">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-deep opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal-deep" />
                </span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-deep">
                  Plateforme civique citoyenne • Madagascar
                </span>
              </span>

              <h1 data-hero className="font-newsreader text-[40px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[56px] lg:leading-[1.05em] lg:tracking-[-0.02em]">
                Dénoncez la corruption.{" "}
                <em className="font-normal italic text-teal-deep">En protégeant</em> votre anonymat.
              </h1>

              <p data-hero className="max-w-2xl text-[17px] leading-[1.6em] text-ink-muted lg:text-[18px]">
                LAZA permet de signaler anonymement des faits de corruption documentés, avec des
                preuves sous sceau cryptographique et une modération éditoriale systématique avant
                publication.
              </p>

              <div data-hero className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/signaler"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-slate-ink px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors duration-150 hover:bg-teal-mid"
                >
                  Signaler un fait
                  <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/fil"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-[14px] font-medium text-ink shadow-sm transition-colors duration-150 hover:bg-paper"
                >
                  Explorer les signalements
                  <Compass className="size-[18px] text-muted-ink" />
                </Link>
              </div>

              <p data-hero className="flex items-center gap-2 pt-1 text-[12px] text-muted-ink">
                <ShieldCheck className="size-5 shrink-0 text-secure" />
                Votre CIN ne quitte jamais votre appareil : seule son empreinte SHA-256 est
                transmise au serveur.
              </p>
            </div>

            {/* Carte de dossier (artefact) */}
            <div data-hero className="relative lg:col-span-5">
              <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-teal-deep/10 blur-2xl" />
              <div className="relative rounded-xl bg-paper p-6 shadow-md transition-shadow duration-200 hover:shadow-xl">
                {heroReport ? (
                  <>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] uppercase text-muted-ink">
                            {heroReport.authorName ? `@${heroReport.authorName}` : "Anonyme"}
                          </span>
                          <span className="text-[10px] text-muted-ink">•</span>
                          {heroReport.region && (
                            <span className="font-mono text-[11px] uppercase text-muted-ink">
                              {heroReport.region}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-ink">•</span>
                          <span className="text-[12px] text-muted-ink">
                            {relativeTimeFr(heroReport.publishedAt ?? heroReport.createdAt)}
                          </span>
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-teal-deep/10 px-2 py-0.5 font-mono text-[11px] text-teal-deep">
                          <VerifiedIcon />
                          Preuves vérifiées
                        </span>
                      </div>
                      <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                        {CATEGORY_LABELS[heroReport.category]}
                      </span>
                    </div>

                    <h2 className="mb-2 font-newsreader text-[22px] font-semibold leading-[1.2em] tracking-[-0.01em] text-ink">
                      {heroReport.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 text-[15px] leading-[1.5em] text-ink-muted">
                      {heroReport.summary}
                    </p>

                    {heroReport.evidence[0] && (
                      <div className="mb-4 rounded-lg bg-white p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
                            <FileText className="size-5 text-teal-deep" />
                            {heroReport.evidence[0].fileName}
                          </span>
                          <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] uppercase text-secure">
                            SHA-256 scellé
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-muted-ink">
                          <span>
                            {EVIDENCE_LABELS[heroReport.evidence[0].kind]} ·{" "}
                            {formatBytes(heroReport.evidence[0].size)}
                          </span>
                          <span className="font-mono">{shortHash(heroReport.evidence[0].checksum)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-5">
                        <span className="inline-flex items-center gap-1 text-muted-ink">
                          <ThumbsUp className="size-[18px]" />
                          <span className="text-[14px] font-medium">{likeCount}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-ink">
                          <Share2 className="size-[18px]" />
                          <span className="text-[14px] font-medium">—</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-ink">
                          <Paperclip className="size-[18px]" />
                          <span className="text-[14px] font-medium">{heroReport.evidence.length}</span>
                        </span>
                      </div>
                      <Link
                        href={`/signalement/${heroReport.slug}`}
                        className="inline-flex items-center gap-1 text-[14px] font-semibold text-teal-deep hover:text-teal-mid"
                      >
                        Consulter le dossier
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="py-8 text-center text-[15px] text-muted-ink">
                    Aucun signalement publié pour le moment. Le premier dossier vérifié apparaîtra ici.
                  </p>
                )}
              </div>
              <p className="mt-3 flex items-center justify-center gap-2 text-[12px] italic text-muted-ink">
                <Info className="size-[15px]" />
                Aperçu d&apos;un signalement authentifié et rendu public après examen collégial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= MÉTRIQUES ============================= */}
      <section id="impact" className="scroll-mt-20 border-b border-hairline bg-paper py-8">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4" data-reveal>
            <MetricBlock label="Dossiers documentés" value={formatNumber(published)} caption={`${published} publiés`} />
            <MetricBlock label="Preuves scellées" value={formatNumber(evidenceCount)} caption="Empreintes SHA-256 vérifiées" />
            <MetricBlock label="Protocole d'identité" value="SHA-256" caption="Empreinte calculée sur votre appareil — jamais votre CIN" accent />
            <MetricBlock label="Soutiens citoyens" value={formatNumber(supportCount)} caption="Likes & commentaires" />
          </div>
        </div>
      </section>

      {/* ============================= 3 PRINCIPES ============================= */}
      <section id="pourquoi-laza" className="scroll-mt-20 border-b border-hairline bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="mb-10 max-w-3xl" data-fade>
            <EyebrowLabel>Architecture Citoyenne</EyebrowLabel>
            <SectionTitle>Une plateforme pensée pour faire entendre les faits.</SectionTitle>
            <p className="mt-3 text-[17px] leading-[1.6em] text-ink-muted">
              LAZA allie rigueur procédurale, protection totale de la source et viralité civique pour
              transformer un témoignage isolé en vérité collective inaltérable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3" data-reveal>
            <PrincipleCard
              icon={<Fingerprint className="size-7 text-teal-deep" />}
              title="Anonymat par empreinte"
              body="Votre Carte d'Identité Nationale ne quitte jamais votre navigateur. LAZA reconnaît l'authenticité d'un même auteur via une empreinte cryptographique unidirectionnelle, sans jamais stocker son identité réelle."
              footer="Protocole client SHA-256"
            />
            <PrincipleCard
              icon={<BadgeCheck className="size-7 text-teal-deep" />}
              title="Preuves vérifiées"
              body="Chaque signalement doit impérativement être documenté. L&apos;empreinte SHA-256 de chaque pièce est calculée sur votre appareil puis revérifiée côté serveur, et la modération contrôle l&apos;étayage du dossier avant toute publication."
              footer="Scellé numérique inaltérable"
            />
            <PrincipleCard
              icon={<Share2 className="size-7 text-teal-deep" />}
              title="Une parole qui se propage"
              body="La censure s'efface face au réseau. Une fois publié et authentifié, chaque dossier dispose de formats d'export sécurisés prêts à être diffusés sur WhatsApp, Facebook, X et aux rédactions d'investigation."
              footer="Diffusion multi-canale"
            />
          </div>
        </div>
      </section>

      {/* ============================= COMMENT ÇA MARCHE ============================= */}
      <section id="comment-ca-marche" className="scroll-mt-20 border-b border-hairline bg-paper py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end" data-fade>
            <div>
              <EyebrowLabel>Procédure Opérationnelle</EyebrowLabel>
              <SectionTitle>Signaler en quatre étapes.</SectionTitle>
            </div>
            <p className="max-w-md text-[15px] leading-[1.5em] text-ink-muted">
              Un parcours guidé pensé pour concilier simplicité d&apos;usage citoyen et étanchéité juridique absolue.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" data-reveal>
            <StepCard
              n="01"
              title="Détails des faits"
              body="Décrivez les agissements observés, la localisation administrative précise et la chronologie des événements sans mentionner votre propre patronyme."
              icon={<PenLine className="size-4 text-teal-deep" />}
              footer="Contexte spatio-temporel"
            />
            <StepCard
              n="02"
              title="Dépôt des preuves"
              body="Téléversez vos pièces (PDF, captures, reçus, photos). L&apos;empreinte SHA-256 de chaque fichier est calculée sur votre appareil avant envoi, puis vérifiée à nouveau côté serveur."
              icon={<Upload className="size-4 text-teal-deep" />}
              footer="Empreinte locale SHA-256"
            />
            <StepCard
              n="03"
              title="Scellement local"
              body="Votre CIN et votre date de naissance servent à composer localement une empreinte SHA-256. Ce calcul est exécuté dans la mémoire vive de votre navigateur et jamais transmis au serveur."
              icon={<KeyRound className="size-4 text-teal-deep" />}
              footer="Jamais transmis au serveur"
            />
            <StepCard
              n="04"
              title="Avertissement légal"
              body="Examinez les clauses de protection de l'intérêt public, validez la solennité de votre déclaration et déclenchez l'acheminement sécurisé vers la modération."
              icon={<UserCheck className="size-4 text-teal-deep" />}
              footer="Soumission sous mandat"
            />
          </div>
        </div>
      </section>

      {/* ============================= ARCHITECTURE PRIVACITÉ ============================= */}
      <section id="protection" className="scroll-mt-20 border-b border-hairline bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="rounded-xl bg-canvas-dark p-8 text-on-primary lg:p-12">
            <div className="mb-10 max-w-3xl" data-fade>
              <span className="mb-4 inline-flex items-center gap-2 rounded-md bg-teal-deep/20 px-2.5 py-1 font-mono text-[11px] uppercase text-teal-light">
                <Terminal className="size-4" />
                Architecture Privacy by Design · Client-Side Cryptography
              </span>
              <h2 className="mb-3 font-newsreader text-[28px] font-medium leading-[1.2em] tracking-[-0.01em] text-surface-container-lowest lg:text-[38px]">
                Votre identité n&apos;est pas notre produit.
              </h2>
              <p className="text-[17px] leading-[1.6em] text-surface-variant">
                Notre infrastructure technique est délibérément conçue pour que nous ne stockions
                jamais votre identité en clair. Aucun cookie de publicité ou de tracking tiers,
                aucune base nominative : seules des empreintes cryptographiques anonymes sont
                conservées.
              </p>
            </div>

            <div className="mb-10 overflow-x-auto pb-2" data-reveal>
              <div className="flex min-w-[700px] items-center justify-between gap-2">
                <PipelineNode n="01" label="Origine" icon={<Laptop className="size-[18px]" />} title="Votre Navigateur" caption="Environnement d'exécution isolé côté client." glow={false} />
                <ArrowRight className="shrink-0 text-surface-variant" />
                <PipelineNode n="02" label="Donnée locale" icon={<BadgeCheck className="size-[18px]" />} title="CIN (saisie locale)" caption="Restreint à la mémoire volatile (RAM)." glow={false} />
                <ArrowRight className="shrink-0 text-surface-variant" />
                <PipelineNode n="03" label="Fonction hash" icon={<KeyRound className="size-[18px]" />} title="SHA-256 + Salt" caption="Transformation mathématique irréversible." glow={false} />
                <ArrowRight className="shrink-0 text-surface-variant" />
                <PipelineNode n="04" label="Reçu numérique" icon={<Fingerprint className="size-[18px]" />} title="Empreinte scellée" caption="Jeton anonyme de signature unique." glow={false} />
                <ArrowRight className="shrink-0 text-surface-variant" />
                <PipelineNode n="05" label="Stockage" icon={<Server className="size-[18px]" />} title="Serveurs LAZA" caption="Reçoit uniquement l'empreinte chiffrée." glow />
              </div>
            </div>

            <div data-fade className="flex items-start gap-3 rounded-lg bg-slate-ink p-4">
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-teal-light" />
              <p className="text-[15px] leading-[1.5em] text-surface-variant">
                <strong className="font-medium text-surface-container-lowest">Vos données en clair ne sont jamais stockées :</strong>{" "}
                le numéro de Carte d&apos;Identité Nationale, le nom et la date de naissance ne transitent
                jamais sur le réseau et ne sont sauvegardés dans aucune base de données. Conformément aux
                mentions du formulaire de signalement, l&apos;anonymat ne peut être levé que sur réquisition
                judiciaire, en cas de dénonciation abusive avérée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= MODÉRATION ============================= */}
      <section id="moderation" className="scroll-mt-20 border-b border-hairline bg-canvas-tint py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="mb-10 max-w-3xl" data-fade>
            <EyebrowLabel>Rigueur Déontologique</EyebrowLabel>
            <SectionTitle>Pas de rumeurs. Des faits documentés.</SectionTitle>
            <p className="mt-3 text-[17px] leading-[1.6em] text-ink-muted">
              LAZA n&apos;est ni un défouloir anonyme ni un espace de vindicte incontrôlée. Chaque
              déposition suit une chaîne de validation stricte avant toute parution sur le registre public.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" data-reveal>
            <ModerationCard
              step="ÉTAPE 1"
              icon={<PenLine className="size-[18px]" />}
              title="Signalement citoyen"
              body="Réception chiffrée du dossier dans l'antichambre isolée. Le lanceur d'alerte reçoit une clé privée de suivi sans identifiant personnel."
            />
            <ModerationCard
              step="ÉTAPE 2"
              icon={<BarChart3 className="size-[18px]" />}
              title="Vérification technique"
              body="Contrôle de l'empreinte SHA-256 des pièces, étude de leur cohérence interne et recoupement avec les sources publiques disponibles."
            />
            <ModerationCard
              step="ÉTAPE 3"
              icon={<Gavel className="size-[18px]" />}
              title="Modération & anonymisation"
              body="Revue humaine collégiale par le comité de vigilance : protection des victimes, suppression des noms de tiers non pertinents."
            />
            <ModerationCard
              step="ÉTAPE 4"
              icon={<CheckCircle2 className="size-[18px]" />}
              title="Publication certifiée"
              body="Intégration au registre public ouvert. Le dossier devient consultable, vérifiable par la presse et diffusable par la communauté."
              accent
            />
          </div>
        </div>
      </section>

      {/* ============================= REGISTRE OUVERT ============================= */}
      <section id="registre" className="scroll-mt-20 border-b border-hairline bg-paper py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end" data-fade>
            <div>
              <EyebrowLabel>Registre Ouvert</EyebrowLabel>
              <SectionTitle>Découvrez ce qui est signalé.</SectionTitle>
            </div>
            <Link
              href="/fil"
              className="group inline-flex items-center gap-2 text-[14px] font-semibold text-teal-deep transition-colors hover:text-teal-mid"
            >
              Consulter les {published} signalement{published > 1 ? "s" : ""}
              <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {teasers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3" data-reveal>
              {teasers.map((report) => (
                <article
                  key={report.id}
                  className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] uppercase text-ink">
                        {CATEGORY_LABELS[report.category]}
                      </span>
                      <span className="text-[12px] text-muted-ink">
                        {relativeTimeFr(report.publishedAt ?? report.createdAt)}
                      </span>
                    </div>
                    <span className="mb-2 inline-flex items-center gap-1 font-mono text-[11px] text-secure">
                      <BadgeCheck className="size-3.5" />
                      {report.evidence.length} pièce{report.evidence.length > 1 ? "s" : ""} scellée{report.evidence.length > 1 ? "s" : ""}
                    </span>
                    <h3 className="mb-2 font-newsreader text-[20px] font-semibold leading-[1.25em] tracking-[-0.01em] text-ink">
                      {report.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-[15px] leading-[1.5em] text-ink-muted">
                      {report.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-muted-ink">
                    <span className="text-[12px]">
                      {report.region ? `Localisation : ${report.region}` : "Localisation : —"}
                    </span>
                    <Link
                      href={`/signalement/${report.slug}`}
                      className="inline-flex items-center gap-1 text-[14px] font-medium text-teal-deep hover:underline"
                    >
                      Voir la fiche
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <Database className="mx-auto mb-3 size-8 text-muted-ink/40" />
              <p className="text-[15px] text-muted-ink">
                Aucun signalement publié pour le moment. Rendez-vous sur{" "}
                <Link href="/signaler" className="text-teal-deep hover:underline">le formulaire</Link>.
              </p>
            </div>
          )}

          <div data-fade className="mt-8 flex flex-col items-start justify-between gap-5 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Database className="size-7 shrink-0 text-teal-deep" />
              <div>
                <p className="font-newsreader text-[18px] font-semibold text-ink">
                  Consulter l&apos;ensemble du registre public
                </p>
                <p className="text-[13px] text-ink-muted">
                  Recherche multicritère par région, ministère, type d&apos;infraction et statut de vérification.
                </p>
              </div>
            </div>
            <Link
              href="/fil"
              className="shrink-0 rounded-md bg-slate-ink px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-teal-mid"
            >
              Explorer les signalements
            </Link>
          </div>
        </div>
      </section>

      {/* ============================= PARTAGE ============================= */}
      <section className="border-b border-hairline bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-6" data-fade>
              <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
                Force de Dissuasion
              </span>
              <SectionTitle>Un fait vérifié peut aller plus loin.</SectionTitle>
              <p className="text-[17px] leading-[1.6em] text-ink-muted">
                L&apos;information vérifiée ne doit pas rester confinée dans un dossier fermé.
                Chaque signalement publié dispose de boutons de partage et d&apos;un lien permanent,
                pour que les citoyens, les collectifs et les journalistes d&apos;enquête puissent
                relayer la fiche publique.
              </p>
              <ul className="space-y-3 pt-1">
                {[
                  "Partage en un clic sur WhatsApp, X, Facebook, LinkedIn et Instagram.",
                  "Lien permanent de la fiche vérifiée, consultable par la presse et le public.",
                  "Lien et référence partageables pour saisir les autorités (BIANCO) et les rédactions.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[15px] text-ink-muted">
                    <Check className="mt-0.5 size-5 shrink-0 text-secure" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-paper p-8 lg:col-span-6" data-reveal>
              <div className="flex flex-col items-center">
                <div className="mb-10 w-full max-w-sm rounded-lg bg-white p-4 text-center shadow-sm">
                  <span className="mb-1 block font-mono text-[11px] uppercase text-teal-deep">
                    Source du flux
                  </span>
                  <h5 className="font-newsreader text-[17px] font-semibold text-ink">
                    Fiche signalement certifiée LAZA
                  </h5>
                  <span className="text-[12px] text-muted-ink">Hash SHA-256 + Sceau de modération</span>
                </div>

                <div className="mb-10 flex size-8 items-center justify-center rounded-full bg-surface-container">
                  <Share2 className="size-[18px] text-muted-ink" />
                </div>

                <div className="grid w-full grid-cols-2 gap-4">
                  <ChannelCard icon={<MessageCircle className="size-5 text-teal-deep" />} title="WhatsApp" caption="Partage direct sécurisé" />
                  <ChannelCard icon={<Globe className="size-5 text-teal-deep" />} title="X & Facebook" caption="Diffusion publique virale" />
                  <ChannelCard icon={<Newspaper className="size-5 text-teal-deep" />} title="Presse d'enquête" caption="Relais des rédactions" />
                  <ChannelCard icon={<Landmark className="size-5 text-teal-deep" />} title="Autorités & société civile" caption="Saisine du BIANCO, veille citoyenne" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= CTA FINAL ============================= */}
      <section className="bg-canvas-tint py-20 lg:py-24">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center" data-fade>
            <div className="mb-8 inline-flex size-14 items-center justify-center rounded-xl bg-white text-teal-deep shadow-sm">
              <Megaphone className="size-8" />
            </div>
            <h2 className="mb-3 font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[52px] lg:leading-[1.05em]">
              Vous avez été témoin d&apos;un fait ?
            </h2>
            <p className="mb-10 max-w-xl text-[17px] leading-[1.6em] text-ink-muted">
              Documentez-le. Signalez-le en toute sérénité. Faites entendre les faits pour protéger
              l&apos;intérêt public malgache.
            </p>
            <div className="mb-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/signaler"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-ink px-6 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors duration-150 hover:bg-teal-mid sm:w-auto"
              >
                Déposer un signalement sécurisé
                <Lock className="size-[18px]" />
              </Link>
              <Link
                href="/fil"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-2.5 text-[14px] font-medium text-ink shadow-sm transition-colors duration-150 hover:bg-paper sm:w-auto"
              >
                Consulter les dossiers vérifiés
                <Search className="size-[18px]" />
              </Link>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                Plateforme indépendante d&apos;intérêt public citoyen malgache
              </span>
              <span className="text-[12px] text-muted-ink">
                Code source ouvert sous licence civile • Aucune affiliation partisane ni gouvernementale
              </span>
            </div>
          </div>
        </div>
      </section>
      </LandingReveal>
    </div>
  )
}

/* ---------- Sous-composants locaux ---------- */

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 1l2.6 2.1 3.3-.4 1 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-1 3.2-3.3-.4L12 22l-2.6-2.1-3.3.4-1-3.2-3-1.5 1.2-3.1L2.1 9.5l3-1.5 1-3.2 3.3.4L12 1zm-1.2 14.1l5.3-5.3-1.4-1.4-3.9 3.9-1.6-1.6-1.4 1.4 3 3z" />
    </svg>
  )
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—"
  const units = ["o", "Ko", "Mo", "Go"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${units[unit]}`
}

function MetricBlock({
  label,
  value,
  caption,
  accent = false,
}: {
  label: string
  value: string
  caption: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[11px] uppercase text-muted-ink">{label}</span>
      <span className="mt-0.5 font-newsreader text-[30px] font-semibold leading-tight text-ink">
        {value}
      </span>
      <span className={`mt-0.5 text-[12px] ${accent ? "text-teal-deep" : "text-muted-ink"}`}>{caption}</span>
    </div>
  )
}

function PrincipleCard({
  icon,
  title,
  body,
  footer,
}: {
  icon: React.ReactNode
  title: string
  body: string
  footer: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-paper p-8 transition-colors duration-200 hover:bg-canvas-tint">
      <div>
        <div className="mb-8 flex size-12 items-center justify-center rounded-lg bg-white shadow-sm">
          {icon}
        </div>
        <h3 className="mb-3 font-newsreader text-[22px] font-semibold leading-[1.2em] text-ink">{title}</h3>
        <p className="text-[15px] leading-[1.5em] text-ink-muted">{body}</p>
      </div>
      <span className="mt-8 block font-mono text-[11px] uppercase text-muted-ink">{footer}</span>
    </div>
  )
}

function StepCard({
  n,
  title,
  body,
  icon,
  footer,
}: {
  n: string
  title: string
  body: string
  icon: React.ReactNode
  footer: string
}) {
  return (
    <div className="relative flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
      <div>
        <span className="mb-4 block font-newsreader text-[28px] font-light text-muted-ink/30">{n}</span>
        <h4 className="mb-2 font-newsreader text-[19px] font-semibold text-ink">{title}</h4>
        <p className="text-[13px] leading-[1.5em] text-ink-muted">{body}</p>
      </div>
      <div className="mt-8 flex items-center gap-2 pt-3 font-mono text-[11px] text-muted-ink">
        {icon}
        <span>{footer}</span>
      </div>
    </div>
  )
}

function PipelineNode({
  n,
  label,
  icon,
  title,
  caption,
  glow,
}: {
  n: string
  label: string
  icon: React.ReactNode
  title: string
  caption: string
  glow: boolean
}) {
  return (
    <div className={`flex-1 rounded-lg p-3 ${glow ? "bg-teal-deep/20" : "bg-slate-ink"}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase text-teal-light">
          {n}. {label}
        </span>
        <span className="text-surface-variant">{icon}</span>
      </div>
      <h5 className="mb-0.5 font-newsreader text-[15px] font-semibold text-surface-container-lowest">{title}</h5>
      <p className="text-[12px] text-surface-variant">{caption}</p>
    </div>
  )
}

function ModerationCard({
  step,
  icon,
  title,
  body,
  accent = false,
}: {
  step: string
  icon: React.ReactNode
  title: string
  body: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm">
      <div
        className={`mb-4 flex items-center gap-2 font-mono text-[11px] ${
          accent ? "text-secure" : "text-teal-deep"
        }`}
      >
        {icon}
        <span>{step}</span>
      </div>
      <h4 className="mb-2 font-newsreader text-[19px] font-semibold text-ink">{title}</h4>
      <p className="text-[13px] leading-[1.5em] text-ink-muted">{body}</p>
    </div>
  )
}

function ChannelCard({ icon, title, caption }: { icon: React.ReactNode; title: string; caption: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-deep/10">
        {icon}
      </div>
      <div>
        <h6 className="text-[15px] font-semibold text-ink">{title}</h6>
        <span className="text-[12px] text-muted-ink">{caption}</span>
      </div>
    </div>
  )
}