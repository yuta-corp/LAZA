import type { Metadata } from "next"
import Link from "next/link"
import { Cookie, Fingerprint, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Politique de cookies — Laza",
  description:
    "Quels cookies Laza dépose, pourquoi, et comment modifier vos préférences de consentement.",
}

const COOKIES = [
  {
    name: "laza_cookie_consent",
    role: "Préférence de consentement",
    details: "Conserve votre choix (accepter / refuser) affiché par le bandeau.",
    duration: "12 mois",
    type: "Essentiel",
  },
  {
    name: "laza_fp",
    role: "Empreinte d'identité anonyme",
    details:
      "Valeur SHA-256 générée sur votre appareil, utilisée pour vos votes et commentaires sans lien avec votre identité réelle.",
    duration: "12 mois",
    type: "Fonctionnel",
  },
  {
    name: "laza_fp_salt",
    role: "Sel de l'empreinte",
    details:
      "Sel servant à dériver l'empreinte ci-dessus. Conservé uniquement pour permettre la correspondance côté serveur.",
    duration: "12 mois",
    type: "Fonctionnel",
  },
  {
    name: "theme",
    role: "Préférence d'affichage",
    details: "Mémorise votre choix de thème clair ou sombre.",
    duration: "1 an",
    type: "Fonctionnel",
  },
  {
    name: "Cookies de session Clerk",
    role: "Session d'administration",
    details:
      "Déposés uniquement sur l'espace d'administration authentifié (gestion des signalements et de la modération).",
    duration: "Jusqu'à 30 jours",
    type: "Essentiel (admin)",
  },
]

function Chip({ children, tone }: { children: React.ReactNode; tone: "sec" | "func" }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
        tone === "sec" ? "bg-teal-deep/10 text-teal-deep" : "bg-paper text-ink-muted"
      }`}
    >
      {children}
    </span>
  )
}

export default function CookiesPage() {
  return (
    <div className="bg-canvas-tint">
      <div className="mx-auto max-w-[52rem] px-6 py-16 lg:py-20">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
          Documents juridiques
        </p>
        <h1 className="mb-4 flex items-center gap-3 font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[44px]">
          <Cookie className="size-9 text-teal-deep" />
          Politique de cookies
        </h1>
        <p className="mb-10 text-[15px] leading-relaxed text-ink-muted">
          Ce qui suit décrit les cookies déposés par Laza, leur finalité et la manière de modifier
          vos préférences. Laza ne dépose aucun cookie publicitaire ni aucun cookie de tracking
          tiers.
        </p>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-paper">
            <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
              <thead>
                <tr className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                  <th className="border-b border-hairline px-4 py-3">Cookie</th>
                  <th className="border-b border-hairline px-4 py-3">Rôle</th>
                  <th className="border-b border-hairline px-4 py-3">Durée</th>
                  <th className="border-b border-hairline px-4 py-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((c) => (
                  <tr key={c.name} className="align-top">
                    <td className="border-b border-hairline px-4 py-3 font-mono text-[12px] text-ink">
                      {c.name}
                    </td>
                    <td className="border-b border-hairline px-4 py-3 leading-[1.5em] text-ink-muted">
                      {c.details}
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline px-4 py-3 text-ink-muted">
                      {c.duration}
                    </td>
                    <td className="border-b border-hairline px-4 py-3">
                      <Chip tone={c.type === "Essentiel" ? "sec" : "func"}>{c.type}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-paper p-6">
            <h2 className="mb-3 flex items-center gap-2 font-newsreader text-[20px] font-semibold tracking-[-0.01em] text-ink">
              <Fingerprint className="size-5 text-teal-deep" />
              Empreinte anonyme, pas de traçage personnel
            </h2>
            <p className="mb-2 text-[15px] leading-[1.6em] text-ink-muted">
              Les cookies <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[12px]">laza_fp</code>{" "}
              et{" "}
              <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[12px]">laza_fp_salt</code>{" "}
              ne contiennent aucune donnée personnelle : il s&apos;agit d&apos;une valeur SHA-256 calculée
              sur votre appareil à partir d&apos;un identifiant aléatoire local. Le serveur ne stocke
              que cette valeur, jamais votre identité réelle.
            </p>
            <p className="text-[15px] leading-[1.6em] text-ink-muted">
              Supprimer ces cookies vous désanonymise pour les votes déjà émis (impossibles à
              rattacher ensuite), mais n&apos;affecte pas le rendu du site ni vos contributions
              passées.
            </p>
          </div>

          <div className="rounded-xl bg-paper p-6">
            <h2 className="mb-3 flex items-center gap-2 font-newsreader text-[20px] font-semibold tracking-[-0.01em] text-ink">
              <ShieldCheck className="size-5 text-teal-deep" />
              Modifier vos préférences
            </h2>
            <p className="mb-3 text-[15px] leading-[1.6em] text-ink-muted">
              Vous pouvez effacer le bandeau de consentement et revenir à un état « sans choix » :
            </p>
            <ol className="ml-5 list-decimal space-y-1 text-[15px] text-ink-muted">
              <li>
                Supprimez le cookie <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[12px]">laza_cookie_consent</code>{" "}
                depuis les paramètres de votre navigateur, ou :
              </li>
              <li>
                <Link href="/legal" className="text-teal-deep hover:underline">
                  contactez-nous
                </Link>{" "}
                (yttuta-mg@proton.me) et le bandeau réapparaîtra à votre prochaine visite.
              </li>
            </ol>
            <p className="mt-3 text-[13px] text-muted-ink">
              Vous pouvez à tout moment supprimer l&apos;ensemble de ces cookies via les réglages de
              votre navigateur. Le traitement des données reste soumis à la loi n° 2014-038
              (autorité de contrôle : CMIL).
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6 text-[13px] text-muted-ink">
          <Link href="/legal" className="transition-colors hover:text-ink">
            Mentions légales
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/cookies" className="font-medium text-teal-deep hover:underline">
            Politique de cookies
          </Link>
        </div>
      </div>
    </div>
  )
}