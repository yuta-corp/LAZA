import Link from "next/link";
import {
  BadgeCheck,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Mic,
  MapPin,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/share-buttons";
import { CATEGORY_LABELS, CATEGORY_VARIANTS, formatDateFr } from "@/lib/report";
import { EvidenceKind } from "@/lib/generated/prisma/enums";
import type { Evidence, Report } from "@/lib/generated/prisma/client";

const EVIDENCE_ICONS: Record<EvidenceKind, typeof FileText> = {
  [EvidenceKind.DOCUMENT]: FileText,
  [EvidenceKind.IMAGE]: ImageIcon,
  [EvidenceKind.VIDEO]: Film,
  [EvidenceKind.AUDIO]: Mic,
  [EvidenceKind.LINK]: Link2,
};

interface ReportCardProps {
  report: Report & { evidence: Evidence[] };
}

export function ReportCard({ report }: ReportCardProps) {
  const kindCounts = report.evidence.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white mb-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-gray-900">Dénonciateur anonyme</span>
            <BadgeCheck className="size-4 text-emerald-600" aria-label="Identité engagée" />
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatDateFr(report.publishedAt ?? report.createdAt)}</span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={CATEGORY_VARIANTS[report.category]}>
              {CATEGORY_LABELS[report.category]}
            </Badge>
            {report.region && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="size-3" />
                {report.region}
              </span>
            )}
          </div>

          <Link href={`/signalement/${report.slug}`} className="mt-2 block">
            <h2 className="text-base leading-snug font-semibold text-gray-900 hover:underline">{report.title}</h2>
          </Link>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{report.summary}</p>

          {report.evidence.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1 font-medium">
                <Paperclip className="size-3.5" />
                {report.evidence.length} preuve{report.evidence.length > 1 ? "s" : ""}
              </span>
              {Object.entries(kindCounts).map(([kind, count]) => {
                const Icon = EVIDENCE_ICONS[kind as EvidenceKind];
                return (
                  <span key={kind} className="inline-flex items-center gap-1">
                    <Icon className="size-3.5" />
                    {count}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ShieldCheck className="size-3.5" />
              Vérifié & publié
            </span>
            <span className="font-mono text-xs text-gray-500">{report.reference}</span>
            <ShareButtons title={report.title} path={`/signalement/${report.slug}`} />
          </div>
        </div>
      </div>
    </div>
  );
}