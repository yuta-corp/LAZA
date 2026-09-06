import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Scale } from "lucide-react"

/**
 * Avertissement légal affiché sur les pages publiques et dans le formulaire
 * de signalement (Art. 373.1 du Code pénal malgache — dénonciation abusive).
 */
export function LegalWarning({ compact = false }: { compact?: boolean }) {
  return (
    <Alert variant="destructive">
      <Scale />
      <AlertTitle className="font-semibold">Avertissement légal</AlertTitle>
      <AlertDescription>
        Toute dénonciation doit être de bonne foi et étayée par des preuves. En vertu de
        l&apos;article 373.1 du Code pénal malgache, la dénonciation abusive est punie de{" "}
        <strong>6 mois à 5 ans d&apos;emprisonnement</strong> et d&apos;une amende de{" "}
        <strong>1 à 10 millions d&apos;Ariary</strong>. Les signalements sont soumis à une vérification
        préalable par une équipe de modération indépendante. Les données à caractère personnel
        sont traitées conformément à la loi n° 2014-038 (déclaration CMIL).
        {!compact && (
          <>
            {" "}
            En cas de dénonciation abusive avérée, l&apos;identité du déclarant peut être levée sur
            réquisition judiciaire.
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}