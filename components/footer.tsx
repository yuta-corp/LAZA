import Link from "next/link"
import { Gavel, Lock } from "lucide-react"
import { Logo } from "@/components/logo"

const NAVIGATION = [
  { label: "Accueil", href: "/" },
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Pourquoi LAZA", href: "/#pourquoi-laza" },
  { label: "Registre public", href: "/fil" },
]

const TRANSPARENCE = [
  { label: "Protocole de modération", href: "/#moderation" },
  { label: "Indicateurs & métriques", href: "/#impact" },
  { label: "Registre des signalements", href: "/fil" },
]

const DROITS = [
  { label: "Protection des sources", href: "/#protection" },
  { label: "Cadre juridique malgache", href: "/#cadre-juridique" },
  { label: "Mentions légales", href: "/legal" },
  { label: "Conditions d'utilisation", href: "/terms" },
  { label: "Politique de cookies", href: "/cookies" },
  { label: "Signaler un fait", href: "/signaler" },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-white">
      <div className="mx-auto max-w-[72rem] px-6 py-12">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="pr-0 lg:col-span-2 lg:pr-8">
            <div className="mb-3 flex items-center gap-1">
              <Logo size={30} />
              <span className="size-2 rounded-full bg-teal-deep" />
            </div>
            <p className="mb-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Plateforme civique indépendante pour le signalement sécurisé, le recoupement et la
              documentation des faits de corruption à Madagascar.
            </p>
            <span className="inline-flex items-center gap-2 rounded-md bg-paper px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
              <Lock className="size-4 text-secure" />
              Empreintes SHA-256 calculées sur votre appareil
            </span>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink">
              Transparence
            </h4>
            <ul className="space-y-2.5">
              {TRANSPARENCE.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink">
              Confidentialité & Droits
            </h4>
            <ul className="space-y-2.5">
              {DROITS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="cadre-juridique" className="space-y-4 border-t border-hairline pt-8">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
            <Gavel className="mt-0.5 size-4 shrink-0 text-vermilion" />
            <span>
              <strong className="font-semibold text-ink">Avertissement solennel :</strong> les
              signalements publiés sont des faits allégués, examinés et validés par une modération
              indépendante avant publication. LAZA ne constitue pas une autorité judiciaire et ne
              remplace pas les procédures officielles : les autorités compétentes (BIANCO) restent
              saisissables des faits signalés. Toute dénonciation abusive est punie par l&apos;article
              373.1 du Code pénal malgache (6 mois à 5 ans d&apos;emprisonnement et amende de 1 à 10
              millions d&apos;Ariary).
            </span>
          </p>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Le traitement des données à caractère personnel est soumis à la loi n° 2014-038 relative
            à la protection des données à caractère personnel, dont l&apos;autorité de contrôle est la
            Commission Malgache de l&apos;Informatique et des Libertés (CMIL). Les preuves sont stockées
            sur un registre ouvert (Vercel Blob) et leur empreinte SHA-256 est recalculée côté serveur
            pour garantir l&apos;intégrité.
          </p>
          <div className="flex flex-col gap-2 pt-2 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em]">
              Plateforme indépendante d&apos;intérêt public citoyen malgache
            </span>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="https://www.bianco.mg"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                BIANCO
              </a>
              <a
                href="https://digital.gov.mg"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                CMIL — protection des données
              </a>
              <a
                href="https://www.justice.gov.mg"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                Ministère de la Justice
              </a>
            </div>
          </div>
          <p className="text-[11px] text-muted-ink">
            © 2026 LAZA MADAGASCAR · Protocole citoyen ouvert · Code source ouvert sous licence civile — aucune affiliation partisane ni gouvernementale.
          </p>
        </div>
      </div>
    </footer>
  )
}