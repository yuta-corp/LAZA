import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportForm } from "@/components/report-form"

export const metadata: Metadata = {
  title: "Signaler un fait de corruption",
  description:
    "Déposez un signalement anonyme avec preuves à l'appui. Votre identité est protégée par une empreinte cryptographique.",
}

export default function SignalerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Signaler un fait de corruption</h1>
        <p className="text-sm text-muted-foreground">
          Environ 5 minutes. Votre identité n&apos;est jamais transmise : seule une empreinte
          cryptographique de votre CIN est enregistrée.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau signalement</CardTitle>
          <CardDescription>
            Les champs marqués * sont obligatoires. Un signalement sans preuve ne sera pas publié.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  )
}