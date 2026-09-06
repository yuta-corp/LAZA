import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma/client"
import {
  Category,
  EvidenceKind,
  ReportStatus,
  VerificationStatus,
} from "../lib/generated/prisma/enums"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

/**
 * Jeu de données de démonstration — signalements FICTIFS.
 * Aucun lien avec des personnes ou faits réels.
 */
async function main() {
  await prisma.evidence.deleteMany()
  await prisma.report.deleteMany()

  const now = new Date()
  const day = 24 * 60 * 60 * 1000

  const reports = [
    {
      slug: "marche-public-surfacture-construction-ecole",
      reference: "LAZ-2026-0001",
      title: "Marché public suspect pour la construction d'une école",
      summary:
        "Un appel d'offres pour la construction d'une école primaire aurait été attribué à un prix supérieur de 40% aux barèmes du secteur.",
      description:
        "Le marché, attribué en décembre 2025, concerne la construction d'une école primaire publique de 12 salles. Les coûts unitaires déclarés au devis sont nettement supérieurs aux prix pratiqués pour des chantiers similaires dans la même région. Des photos du devis et de l'avis d'attribution ont été fournies.",
      category: Category.MARCHES_PUBLICS,
      region: "Analamanga",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 2 * day),
      createdAt: new Date(now.getTime() - 6 * day),
      evidence: [
        { kind: EvidenceKind.DOCUMENT, fileName: "avis-attribution.pdf", mimeType: "application/pdf", size: 184_320 },
        { kind: EvidenceKind.IMAGE, fileName: "devis-panneau.jpg", mimeType: "image/jpeg", size: 2_412_030 },
      ],
    },
    {
      slug: "permis-foncier-deja-attribue-deux-fois",
      reference: "LAZ-2026-0002",
      title: "Un même terrain attribué à deux propriétaires différents",
      summary:
        "Un permis foncier aurait été délivré deux fois pour la même parcelle, à deux personnes différentes, à quelques mois d'intervalle.",
      description:
        "Le cadastre montre deux titres fonciers concurrents pour la même parcelle, délivrés par le même bureau de district. L'une des parties détient des documents d'époque antérieure. Copies des deux titres fournies, différences de numérotation relevées.",
      category: Category.FONCIER,
      region: "Atsinanana",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 5 * day),
      createdAt: new Date(now.getTime() - 12 * day),
      evidence: [
        { kind: EvidenceKind.DOCUMENT, fileName: "titres-fonciers.pdf", mimeType: "application/pdf", size: 402_821 },
        { kind: EvidenceKind.LINK, fileName: "consultation-cadastre", mimeType: "text/html", size: 0 },
      ],
    },
    {
      slug: "fraude-douaniere-conteneur-transit",
      reference: "LAZ-2026-0003",
      title: "Conteneur sous-déclaré au port de Toamasina",
      summary:
        "Un conteneur de marchandises aurait été déclaré à une valeur dix fois inférieure à sa valeur réelle à l'entrée du port.",
      description:
        "La déclaration en douane indique une valeur de 8 millions d'ariary alors que la facture fournisseur jointe au dossier de transport fait état de plus de 80 millions. Photos de la déclaration et du connaissement fournies.",
      category: Category.DOUANES_IMPOTS,
      region: "Atsinanana",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 8 * day),
      createdAt: new Date(now.getTime() - 15 * day),
      evidence: [
        { kind: EvidenceKind.IMAGE, fileName: "declaration-douane.jpg", mimeType: "image/jpeg", size: 1_874_109 },
        { kind: EvidenceKind.DOCUMENT, fileName: "connaissement.pdf", mimeType: "application/pdf", size: 96_412 },
      ],
    },
    {
      slug: "factures-fantomes-hopital-regional",
      reference: "LAZ-2026-0004",
      title: "Factures fantômes dans un hôpital régional",
      summary:
        "Des fournitures médicales auraient été facturées deux fois, avec des quantités supérieures aux stocks réellement livrés.",
      description:
        "Plusieurs bons de livraison présentent des quantités différentes des factures correspondantes. Le stock physique de l'hôpital ne correspond pas aux entrées déclarées. Copies des factures et bons de livraison fournies, ainsi que le relevé de stock.",
      category: Category.SANTE,
      region: "Haute Matsiatra",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 12 * day),
      createdAt: new Date(now.getTime() - 20 * day),
      evidence: [
        { kind: EvidenceKind.DOCUMENT, fileName: "factures-hopital.pdf", mimeType: "application/pdf", size: 720_042 },
        { kind: EvidenceKind.DOCUMENT, fileName: "releve-stock.xlsx", mimeType: "application/pdf", size: 310_880 },
      ],
    },
    {
      slug: "enquetes-baccalaureat-fuite-sujets",
      reference: "LAZ-2026-0005",
      title: "Suspicion de fuite des sujets d'examen dans une académie",
      summary:
        "Des sujets du baccalauréat auraient circulé sur des groupes de messagerie avant le jour de l'épreuve.",
      description:
        "Des captures d'écran montrent des sujets diffusés la veille de l'épreuve sur un groupe privé. Les numéros d'épreuve correspondent aux sujets officiels publiés le lendemain. Les captures ont été fournies.",
      category: Category.EDUCATION,
      region: "Boeny",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 19 * day),
      createdAt: new Date(now.getTime() - 30 * day),
      evidence: [
        { kind: EvidenceKind.IMAGE, fileName: "capture-groupe.jpg", mimeType: "image/jpeg", size: 1_203_448 },
      ],
    },
    {
      slug: "detournement-prets-caisse-mutuelle",
      reference: "LAZ-2026-0006",
      title: "Détournement présumé de prêts dans une caisse mutuelle",
      summary:
        "Des prêts auraient été contractés au nom de membres sans leur consentement, les fonds étant versés sur des comptes tiers.",
      description:
        "Plusieurs membres affirment n'avoir jamais signé les contrats de prêt qui leur sont imputés. La comparaison des signatures sur les contrats et sur les documents d'ouverture de compte montre des différences nettes. Contrats et relevés fournis.",
      category: Category.JUSTICE,
      region: "Vakinankaratra",
      status: ReportStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 26 * day),
      createdAt: new Date(now.getTime() - 34 * day),
      evidence: [
        { kind: EvidenceKind.DOCUMENT, fileName: "contrats-prets.pdf", mimeType: "application/pdf", size: 1_120_355 },
        { kind: EvidenceKind.IMAGE, fileName: "signatures-comparées.jpg", mimeType: "image/jpeg", size: 2_044_112 },
        { kind: EvidenceKind.AUDIO, fileName: "entretien-temoin.mp3", mimeType: "audio/mpeg", size: 8_412_060 },
      ],
    },
  ]

  for (const report of reports) {
    const { evidence, ...data } = report
    await prisma.report.create({
      data: {
        ...data,
        legalAccepted: true,
        legalAcceptedAt: data.createdAt,
        evidence: {
          create: evidence.map((e) => ({
            ...e,
            checksum: `seed-${e.fileName}`,
            verificationStatus: VerificationStatus.PENDING,
          })),
        },
      },
    })
  }

  console.log(`✔ ${reports.length} signalements de démonstration créés.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })