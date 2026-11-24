import Link from "next/link"
import { Hash } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { categoryLabel, getCopy, type Lang } from "@/lib/i18n"
import type { Category } from "@/lib/generated/prisma/enums"

export async function TrendsPanel({ lang = "fr" }: { lang?: Lang }) {
  const t = getCopy(lang).feed

  const grouped = await prisma.report.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { _count: { category: "desc" } },
    take: 6,
  })

  const total = await prisma.report.count({ where: { status: "PUBLISHED" } })

  return (
    <aside
      id="tendances"
      className="sticky top-0 hidden h-svh w-80 flex-col overflow-y-auto border-l border-hairline bg-white px-5 py-6 xl:flex"
    >
      <div className="flex items-center gap-2">
        <Hash className="size-4 text-teal-deep" />
        <h2 className="font-mono text-[11px] font-semibold tracking-[0.18em] text-ink uppercase">
          {t.trendsTitle}
        </h2>
      </div>
      <p className="mt-1.5 text-[13px] text-muted-ink">
        {t.trendsCount(total)}
      </p>

      {grouped.length === 0 ? (
        <p className="mt-4 text-[14px] text-muted-ink">{t.trendsEmpty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {grouped.map((row) => (
            <li key={row.category}>
              <Link
                href={`/fil?categorie=${row.category}`}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-teal-deep"
              >
                <span className="min-w-0 truncate text-[14px] font-medium text-ink">
                  {categoryLabel(lang, row.category as Category)}
                </span>
                <span className="shrink-0 font-mono text-[12px] text-muted-ink tabular-nums">
                  {row._count._all.toString().padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/fil"
        className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-teal-deep hover:underline"
      >
        {t.trendsExplore}
      </Link>
    </aside>
  )
}
