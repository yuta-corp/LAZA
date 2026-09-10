import type { Metadata } from "next"
import Link from "next/link"
import { Gavel, Landmark, Mail, Server, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Mentions légales — Laza",
  description:
    "Mentions légales de la plateforme Laza : éditeur, hébergement, objet du service et cadre juridique malgache.",
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-paper p-6">
      <h2 className="mb-3 font-newsreader text-[20px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-[1.6em] text-ink-muted">{children}</div>
    </div>
  )
}

export default function LegalPage() {
  return (
    <div className="bg-canvas-tint">
      <div className="mx-auto max-w-[48rem] px-6 py-16 lg:py-20">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
          Documents juridiques
        </p>
        <h1 className="mb-6 font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[44px]">
          Mentions légales
        </h1>
        <p className="mb-10 text-[15px] leading-relaxed text-ink-muted">
          Informations légales relatives au service Laza, conformément aux obligations applicables
          en matière d&apos;édition de services en ligne et à la législation malgache.
        </p>

        <div className="space-y-4">
          <LegalSection title="Éditeur du service">
            <p>
              LAZA est un service édité par{" "}
              <strong className="font-semibold text-ink">ANDRIAMAMIVONY Tiavintsoa Ulrich</strong>,
              éditeur individuel.
            </p>
            <p className="flex items-start gap-2">
              <Landmark className="mt-0.5 size-4 shrink-0 text-teal-deep" />
              Siège : IVH80 Mandialaza — Madagascar.
            </p>
            <p>
              Directeur de la publication :{" "}
              <strong className="font-semibold text-ink">ANDRIAMAMIVONY Tiavintsoa Ulrich</strong>.
            </p>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-teal-deep" />
              Contact : yttuta-mg@proton.me — réponse sous 48 h ouvrées.
            </p>
          </LegalSection>

          <LegalSection title="Hébergement">
            <p className="flex items-start gap-2">
              <Server className="mt-0.5 size-4 shrink-0 text-teal-deep" />
              Vercel Inc., 340 Brannan Street, Suite 400, San Francisco, CA 94107, États-Unis.
            </p>
          </LegalSection>

          <LegalSection title="Objet du service">
            <p>
              Laza est une plateforme civique indépendante de signalement anonyme de faits de
              corruption à Madagascar : dépôt de signalements documentés, vérification par une
              modération indépendante, publication sur un registre public ouvert et partage par les
              citoyens et la presse.
            </p>
          </LegalSection>

          <LegalSection title="Traitement des données à caractère personnel">
            <p>
              Laza est conçu pour ne jamais stocker d&apos;identité en clair : aucune donnée
              personnelle nominative (numéro de carte d&apos;identité, nom, date de naissance) n&apos;est
              enregistrée. Seules des empreintes cryptographiques (SHA-256) calculées sur votre
              appareil sont conservées.
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secure" />
              Le traitement des données est soumis à la loi n° 2014-038 relative à la protection des
              données à caractère personnel (autorité de contrôle : CMIL). En cas de dénonciation
              abusive avérée, l&apos;anonymat peut être levé sur réquisition judiciaire, conformément
              aux mentions du formulaire de signalement.
            </p>
          </LegalSection>

          <LegalSection title="Propriété intellectuelle">
            <p>
              L&apos;interface, l&apos;identité visuelle, le logotype et la marque Laza appartiennent à
              l&apos;éditeur du service. Toute reproduction ou réutilisation sans autorisation préalable
              est interdite, hors usage privé. Le code source du service est publié sous licence
              civile ouverte.
            </p>
          </LegalSection>

          <LegalSection title="Responsabilité">
            <p className="flex items-start gap-2">
              <Gavel className="mt-0.5 size-4 shrink-0 text-vermilion" />
              Le service est fourni « en l&apos;état », en mode best-effort. Il ne constitue pas une
              autorité judiciaire et ne remplace pas les procédures officielles : les autorités
              compétentes (
              <a
                href="https://www.bianco-mg.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-teal-deep/40 underline-offset-2 hover:decoration-teal-deep"
              >
                BIANCO
              </a>
              ) restent saisissables des faits signalés. L&apos;éditeur ne saurait
              être tenu responsable des usages qui seraient faits des informations publiées.
            </p>
          </LegalSection>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6 text-[13px] text-muted-ink">
          <Link href="/legal" className="font-medium text-teal-deep hover:underline">
            Mentions légales
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink">
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