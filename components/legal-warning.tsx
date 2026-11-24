"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Scale } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

/**
 * Avertissement légal affiché sur les pages publiques et dans le formulaire
 * de signalement (Art. 373.1 du Code pénal malgache — dénonciation abusive).
 */
export function LegalWarning({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage()

  return (
    <Alert variant="destructive">
      <Scale />
      <AlertTitle className="font-semibold">{t.actions.legal.title}</AlertTitle>
      <AlertDescription>
        {t.actions.legal.intro} <strong>{t.actions.legal.penaltyJail}</strong>{" "}
        {t.actions.legal.and} <strong>{t.actions.legal.penaltyFine}</strong>.{" "}
        {t.actions.legal.outro}
        {!compact && <> {t.actions.legal.extra}</>}
      </AlertDescription>
    </Alert>
  )
}
