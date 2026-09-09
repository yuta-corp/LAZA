import Link from "next/link"
import { Flame } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CATEGORY_DOTS, CATEGORY_LABELS } from "@/lib/report"

interface Trend {
  category: string
  label: string
  count: number
}

export async function TrendsPanel() {
  const grouped = await prisma.report.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { _count: { category: "desc" } },
    take: 6,
  })

  const trends: Trend[] = grouped.map((row) => ({
    category: row.category,
    label: CATEGORY_LABELS[row.category],
    count: row._count._all,
  }))

  const total = await prisma.report.count({ where: { status: "PUBLISHED" } })

  return (
    <aside
      id="tendances"
      className="sticky top-0 hidden h-svh w-80 flex-col gap-4 overflow-y-auto px-4 py-4 xl:flex"
    >
      <div className="rounded-lg bg-secondary text-foreground">
        <div className="flex items-center gap-2 px-4 pt-3">
          <Flame className="size-4 text-accent" />
          <h2 className="text-base font-semibold">Tendances à Madagascar</h2>
        </div>
        <p className="px-4 pt-1 text-xs text-muted-foreground">
          {total} signalement{total > 1 ? "s" : ""} vérifié{total > 1 ? "s" : ""} publié{total > 1 ? "s" : ""}
        </p>

        {trends.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            Aucune tendance pour l&apos;instant.
          </p>
        ) : (
          <ul className="pb-2 pt-2">
            {trends.map(({ category, label, count }) => (
              <li key={category}>
                <Link
                  href={`/?categorie=${category}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {count} signalement{count > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span
                    className={[
                      "h-2 w-2 shrink-0 rounded-full",
                      CATEGORY_DOTS[category as keyof typeof CATEGORY_DOTS],
                    ].join(" ")}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t px-4 py-2.5">
          <Link
            href="/?categorie=AUTRE"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-opacity hover:opacity-80"
          >
            Explorer toutes les tendances
          </Link>
        </div>
      </div>
    </aside>
  )
}