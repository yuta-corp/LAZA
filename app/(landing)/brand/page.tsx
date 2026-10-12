import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Download, Mail, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Ressources presse",
  description:
    "Logotype officiel, icônes, couleurs et règles d'usage de Laza. Ressources libres pour la presse, les ONG et les partenaires institutionnels.",
}

const CONTACT_EMAIL = "yttuta-mg@proton.me"

const ASSETS = [
  {
    label: "Logotype (SVG)",
    detail: "Vectoriel — recommandé pour l'impression et le web",
    href: "/logo.svg",
    size: "127 Ko",
  },
  {
    label: "Logotype (PNG)",
    detail: "800 px de large, fond transparent",
    href: "/brand/logo.png",
    size: "57 Ko",
  },
  {
    label: "Logotype clair (PNG)",
    detail: "Version pour fond encre ou photographie sombre",
    href: "/brand/logo-inverse.png",
    size: "48 Ko",
  },
  {
    label: "Icône d'application (512 px)",
    detail: "Favicon, avatar, application mobile",
    href: "/brand/icon-512.png",
    size: "7 Ko",
  },
  {
    label: "Icône maskable (512 px)",
    detail: "Android — zone de sécurité respectée",
    href: "/brand/icon-maskable-512.png",
    size: "16 Ko",
  },
  {
    label: "Image de partage (1200 × 630)",
    detail: "Open Graph et Twitter, pour un lien partagé",
    href: "/brand/og.png",
    size: "72 Ko",
  },
]

const COLORS = [
  { name: "Encre", hex: "#1a2027", usage: "Titres et textes." },
  { name: "Teal profond", hex: "#006575", usage: "Marque, actions principales." },
  { name: "Teal moyen", hex: "#008094", usage: "Survol, accents secondaires." },
  { name: "Papier", hex: "#f8fafc", usage: "Fonds de section." },
  { name: "Vert vérifié", hex: "#059669", usage: "Statut vérifié, preuves." },
  { name: "Vermillon", hex: "#dc2626", usage: "Avertissements légaux uniquement." },
]

const RULES = [
  "Garder le poing et le lettrage tels quels : on ne redessine pas, on ne déforme pas, on ne recolore pas.",
  "Ne jamais étirer ni incliner le logotype : utiliser uniquement les fichiers fournis ici.",
  "Taille minimale de l'icône : 24 px. Taille minimale du logotype complet : 96 px de large.",
  "Laisser un espace libre autour du logotype égal à la hauteur du poing.",
  "Éviter de poser le logotype sur une photographie chargée : préférer un fond uni clair ou la version claire.",
  "Écrire « Laza » (majuscule initiale) dans le corps d'un texte, « LAZA » uniquement dans le logotype.",
]

export default function BrandPage() {
  return (
    <div className="bg-canvas-tint">
      <div className="mx-auto max-w-[60rem] px-5 py-14 lg:px-6 lg:py-20">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-teal-deep">
          Ressources presse
        </p>
        <h1 className="mt-2 font-newsreader text-[34px] font-medium leading-[1.1em] tracking-[-0.015em] text-ink lg:text-[44px]">
          Identité et ressources de Laza
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-[1.6em] text-ink-muted">
          Cette page rassemble le logotype officiel, les icônes, les couleurs et les règles d&apos;usage.
          Ces éléments peuvent être utilisés sans autorisation préalable pour parler de Laza, dans la
          presse, les rapports d&apos;ONG ou les supports institutionnels.
        </p>

        {/* Logotype */}
        <section className="mt-12">
          <h2 className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Le logotype
          </h2>
          <p className="mt-2 max-w-2xl text-[16px] leading-[1.6em] text-ink-muted">
            Le poing levé et le lettrage forment un seul bloc. Le logotype est carré : il se pose aussi
            bien dans un en-tête que dans une colonne de rapport.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-hairline bg-white p-6">
              <Logo href="/" size={110} />
              <p className="mt-4 text-[13px] text-muted-ink">sur fond clair</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-hairline bg-ink p-6">
              <Image
                src="/brand/logo-inverse.png"
                alt="Logotype Laza en version claire"
                width={110}
                height={111}
                unoptimized
              />
              <p className="mt-4 text-[13px] text-white/60">sur fond encre</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-hairline bg-paper p-6">
              <Image
                src="/brand/icon-512.png"
                alt="Icône Laza"
                width={72}
                height={72}
                unoptimized
                className="rounded-[18%]"
              />
              <p className="mt-4 text-[13px] text-muted-ink">icône d&apos;application</p>
            </div>
          </div>
        </section>

        {/* Téléchargements */}
        <section className="mt-12">
          <h2 className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Fichiers à télécharger
          </h2>
          <ul className="mt-5 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-white">
            {ASSETS.map((asset) => (
              <li key={asset.href}>
                <a
                  href={asset.href}
                  className="flex min-h-16 items-center gap-4 px-5 py-4 transition-colors hover:bg-paper"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
                    <Download className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{asset.label}</span>
                    <span className="block text-[14px] text-ink-muted">{asset.detail}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                    {asset.size}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Couleurs */}
        <section className="mt-12">
          <h2 className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Couleurs
          </h2>
          <p className="mt-2 max-w-2xl text-[16px] leading-[1.6em] text-ink-muted">
            Une palette courte : l&apos;encre porte le texte, le teal profond porte la marque.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {COLORS.map((color) => (
              <li
                key={color.hex}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-3"
              >
                <span
                  aria-hidden="true"
                  className="size-10 shrink-0 rounded-lg border border-hairline"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{color.name}</span>
                  <span className="block font-mono text-[12px] uppercase text-muted-ink">
                    {color.hex}
                  </span>
                  <span className="block text-[13px] text-ink-muted">{color.usage}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Typographie */}
        <section className="mt-12">
          <h2 className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Typographie
          </h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-hairline bg-white p-5">
              <p className="font-newsreader text-[26px] font-medium text-ink">Newsreader</p>
              <p className="mt-1 text-[14px] text-ink-muted">
                Titres et textes de dossier. C&apos;est la voix éditoriale de Laza.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-white p-5">
              <p className="text-[22px] font-semibold text-ink">Inter</p>
              <p className="mt-1 text-[14px] text-ink-muted">
                Interface, libellés, boutons, textes courts.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-white p-5">
              <p className="font-mono text-[20px] font-semibold text-ink">LAZ-2026-0001</p>
              <p className="mt-1 text-[14px] text-ink-muted">
                Monospace réservée aux références de dossier et aux métadonnées.
              </p>
            </div>
          </div>
        </section>

        {/* Règles d'usage */}
        <section className="mt-12">
          <h2 className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Règles d&apos;usage
          </h2>
          <ul className="mt-5 space-y-3">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-3 rounded-xl bg-white p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-secure" />
                <span className="text-[15px] leading-[1.6em] text-ink">{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact presse */}
        <section className="mt-12 rounded-xl border border-hairline bg-white p-6">
          <h2 className="font-newsreader text-[22px] font-semibold text-ink">Contact presse</h2>
          <p className="mt-2 text-[15px] leading-[1.6em] text-ink-muted">
            Pour une interview, des chiffres à jour ou une demande de vérification sur un dossier
            publié, écris-nous. Réponse sous 48 heures ouvrées. Les demandes concernant une personne
            mise en cause sont traitées en priorité.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-deep px-5 text-[15px] font-semibold text-white transition-colors hover:bg-teal-mid"
          >
            <Mail className="size-4" />
            {CONTACT_EMAIL}
          </a>
          <p className="mt-4 text-[14px] text-ink-muted">
            Cadre juridique et éditeur :{" "}
            <Link href="/legal" className="font-medium text-teal-deep underline-offset-4 hover:underline">
              mentions légales
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
