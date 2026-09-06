import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Image src="/log.png" alt="Logo Laza" width={22} height={22} className="size-5.5 rounded" />
              <span className="font-semibold text-foreground">Laza</span>
            </div>
            <p className="mt-3 leading-relaxed">
              Plateforme de dénonciation anonyme de corruption à Madagascar. Chaque signalement
              est vérifié avant publication.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Autorités</p>
              <a href="https://www.bianco.mg" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground">
                BIANCO
              </a>
              <a href="https://digital.gov.mg" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground">
                CMIL — protection des données
              </a>
              <a href="https://www.justice.gov.mg" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground">
                Ministère de la Justice
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Plateforme</p>
              <Link href="/signaler" className="block hover:text-foreground">
                Signaler un fait
              </Link>
              <Link href="/#comment-ca-marche" className="block hover:text-foreground">
                Comment ça marche
              </Link>
              <Link href="/#dernieres-denonciations" className="block hover:text-foreground">
                Dernières dénonciations
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t pt-6 text-xs leading-relaxed">
          Laza ne remplace pas les procédures officielles : les signalements vérifiés peuvent être
          transmis au BIANCO. Le traitement des données personnelles est soumis à la loi n° 2014-038
          et fait l&apos;objet d&apos;une déclaration à la CMIL. Les signalements publiés sont des faits
          allégués, examinés par la modération avant publication — toute dénonciation abusive est
          punie par l&apos;article 373.1 du Code pénal malgache.
        </p>
      </div>
    </footer>
  )
}