import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-canvas-tint px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
        <SearchX className="size-6" />
      </span>
      <p className="mt-5 font-mono text-[11px] font-semibold tracking-[0.2em] text-teal-deep uppercase">
        Erreur 404
      </p>
      <h1 className="mt-3 font-newsreader text-[32px] leading-[1.1em] font-medium tracking-[-0.02em] text-balance text-ink sm:text-[42px]">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-3 max-w-md text-[16px] leading-[1.6em] text-ink-muted">
        Le lien est peut-être erroné, ou le dossier a été retiré. Tu peux
        revenir au registre public des signalements vérifiés.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/fil"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-deep px-6 text-[16px] font-semibold text-white transition-colors hover:bg-teal-mid"
        >
          Voir les signalements
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-[16px] font-medium text-teal-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
