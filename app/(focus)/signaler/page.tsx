import type { Metadata } from "next"
import { ReportForm } from "@/components/report-form"

export const metadata: Metadata = {
  title: "Signaler un fait",
  description:
    "Dépose ton signalement en quatre étapes. Sans ton nom, sans compte, gratuit. Ton numéro de CIN reste sur ton téléphone.",
}

export default function SignalerPage() {
  return <ReportForm />
}
