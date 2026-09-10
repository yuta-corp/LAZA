import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Scale, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Laza",
  description:
    "Conditions d'utilisation de la plateforme Laza de signalement anonyme de faits de corruption à Madagascar.",
}

function TermsSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-paper p-6">
      <h2 className="mb-3 flex items-baseline gap-2 font-newsreader text-[20px] font-semibold tracking-[-0.01em] text-ink">
        <span className="font-mono text-[13px] font-normal text-teal-deep">{n}</span>
        {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-[1.6em] text-ink-muted">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-canvas-tint">
      <div className="mx-auto max-w-[48rem] px-6 py-16 lg:py-20">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
          Documents juridiques
        </p>
        <h1 className="mb-3 font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[44px]">
          Conditions d&apos;utilisation
        </h1>
        <p className="mb-10 text-[13px] text-muted-ink">Dernière mise à jour : septembre 2026.</p>

        <div className="space-y-4">
          <TermsSection n="1." title="Objet">
            <p>
              Laza est une plateforme civique indépendante permettant de signaler anonymement des
              faits de corruption documentés à Madagascar, de suivre leur examen par une modération
              indépendante et de consulter le registre public des signalements vérifiés. L&apos;accès
              au site et au fil public est libre et gratuit.
            </p>
          </TermsSection>

          <TermsSection n="2." title="Nature des signalements">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secure" />
              Chaque signalement doit être fait de bonne foi et étayé par au moins une preuve
              (document, image, vidéo, audio ou lien public). Les informations transmises doivent
              être aussi précises et factuelles que possible.
            </p>
            <p className="flex items-start gap-2">
              <Scale className="mt-0.5 size-4 shrink-0 text-vermilion" />
              Toute dénonciation abusive est punie par l&apos;article 373.1 du Code pénal malgache
              (6 mois à 5 ans d&apos;emprisonnement et amende de 1 à 10 millions d&apos;Ariary).
              L&apos;auteur d&apos;un signalement engage sa responsabilité civile et pénale.
            </p>
          </TermsSection>

          <TermsSection n="3." title="Vérification et publication">
            <p>
              Les signalements sont soumis à une vérification préalable par une équipe de modération
              indépendante avant toute publication. La modération peut demander des compléments,
              refuser ou retirer un signalement qui ne respecterait pas les présentes conditions.
              L&apos;identité du déclarant n&apos;est jamais publiée.
            </p>
            <p>
              En cas de dénonciation abusive avérée, l&apos;anonymat peut être levé sur réquisition
              judiciaire, conformément aux mentions du formulaire de signalement.
            </p>
          </TermsSection>

          <TermsSection n="4." title="Utilisation du service">
            <p>
              Sont interdits : les signalements ou commentaires diffamatoires, injurieux,
              discriminatoires, hors-sujet, ou contenant des données personnelles de tiers non
              concernées par les faits. L&apos;éditeur se réserve le droit de retirer tout contenu
              contrevenant à ces règles.
            </p>
          </TermsSection>

          <TermsSection n="5." title="Propriété intellectuelle">
            <p>
              L&apos;interface, l&apos;identité visuelle, le logotype et la marque Laza appartiennent à
              l&apos;éditeur du service. Le code source du service est publié sous licence civile
              ouverte ; toute réutilisation de la marque ou de l&apos;identité visuelle est soumise à
              une autorisation préalable.
            </p>
          </TermsSection>

          <TermsSection n="6." title="Responsabilité">
            <p>
              Le service est fourni « en l&apos;état », en mode best-effort. Laza ne constitue pas une
              autorité judiciaire et ne remplace pas les procédures officielles : les autorités
              compétentes (BIANCO) restent saisissables des faits signalés. L&apos;éditeur ne saurait
              être tenu responsable des interruptions, erreurs ou conséquences d&apos;un usage des
              informations publiées.
            </p>
          </TermsSection>

          <TermsSection n="7." title="Données personnelles">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secure" />
              Le traitement des données est soumis à la loi n° 2014-038 relative à la protection des
              données à caractère personnel (autorité de contrôle : CMIL). Laza ne stocke jamais
              d&apos;identité en clair — voir la politique de cookies pour le détail des cookies
              déposés. Pour toute question : yttuta-mg@proton.me.
            </p>
          </TermsSection>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6 text-[13px] text-muted-ink">
          <Link href="/legal" className="transition-colors hover:text-ink">
            Mentions légales
          </Link>
          <Link href="/terms" className="font-medium text-teal-deep hover:underline">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-ink">
            Politique de cookies
          </Link>
        </div>
      </div>
    </div>
  )
}