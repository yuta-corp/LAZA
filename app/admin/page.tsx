import Link from "next/link"
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  Paperclip,
  Search,
  XCircle,
} from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, formatDateFr, STATUS_LABELS } from "@/lib/report"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportsCategoryChart } from "@/components/reports-category-chart"
import { cn } from "@/lib/utils"
import { ReportStatus } from "@/lib/generated/prisma/enums"

interface AdminPageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

const TABS = [
  { key: "pending", label: "À traiter", statuses: ["SUBMITTED", "UNDER_REVIEW"] as ReportStatus[] },
  { key: "published", label: "Publiés", statuses: ["PUBLISHED"] as ReportStatus[] },
  { key: "rejected", label: "Rejetés", statuses: ["REJECTED"] as ReportStatus[] },
  {
    key: "all",
    label: "Tous",
    statuses: ["SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "REJECTED"] as ReportStatus[],
  },
] as const

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin()

  const { status, q } = await searchParams
  const tab = TABS.find((t) => t.key === status) ?? TABS[0]
  const query = typeof q === "string" ? q.trim() : ""

  const [counts, pendingByCategory, reports] = await Promise.all([
    prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.report.groupBy({
      by: ["category"],
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      _count: { _all: true },
    }),
    prisma.report.findMany({
      where: {
        status: { in: [...tab.statuses] },
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { reference: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { evidence: true } } },
      take: 100,
    }),
  ])

  const countFor = (statuses: ReportStatus[]) =>
    counts.filter((c) => statuses.includes(c.status)).reduce((acc, c) => acc + c._count._all, 0)

  const stats = [
    {
      label: "À traiter",
      value: countFor(["SUBMITTED", "UNDER_REVIEW"]),
      icon: Inbox,
      href: "/admin",
    },
    {
      label: "En examen",
      value: countFor(["UNDER_REVIEW"]),
      icon: Clock3,
      href: "/admin?status=pending",
    },
    {
      label: "Publiés",
      value: countFor(["PUBLISHED"]),
      icon: CheckCircle2,
      href: "/admin?status=published",
    },
    {
      label: "Rejetés",
      value: countFor(["REJECTED"]),
      icon: XCircle,
      href: "/admin?status=rejected",
    },
  ]

  const chartData = pendingByCategory
    .map((c) => ({ category: CATEGORY_LABELS[c.category], count: c._count._all }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="@container/card transition-colors group-hover:ring-primary/40">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <stat.icon className="size-4 text-primary" />
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stat.value}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="px-4 lg:px-6">
        <ReportsCategoryChart data={chartData} />
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Signalements</CardTitle>
              <CardDescription>
                {tab.label} — {reports.length} résultat{reports.length > 1 ? "s" : ""}
                {query ? ` pour « ${query} »` : ""}
              </CardDescription>
            </div>
            <form action="/admin" method="get" className="flex w-full max-w-xs items-center gap-2">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Référence ou titre…"
                className="h-8"
              />
              {status && status !== "pending" && <input type="hidden" name="status" value={status} />}
              <Button type="submit" size="icon" variant="outline" className="size-8">
                <Search className="size-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </form>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex flex-wrap items-center gap-1 px-4 pb-4 lg:px-6">
              {TABS.map((t) => {
                const active = t.key === tab.key
                return (
                  <Link
                    key={t.key}
                    href={t.key === "pending" ? "/admin" : `/admin?status=${t.key}`}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </Link>
                )
              })}
            </div>
            <div className="overflow-hidden rounded-b-xl border-t">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                    <TableHead className="hidden lg:table-cell">Reçu le</TableHead>
                    <TableHead className="text-center">Preuves</TableHead>
                    <TableHead className="hidden sm:table-cell">Statut</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Aucun signalement dans cette vue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">{report.reference}</TableCell>
                        <TableCell className="max-w-72">
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="line-clamp-2 font-medium hover:underline"
                          >
                            {report.title}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className={CATEGORY_VARIANTS[report.category]}>
                            {CATEGORY_LABELS[report.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                          {formatDateFr(report.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Paperclip className="size-3" />
                            {report._count.evidence}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{STATUS_LABELS[report.status]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            nativeButton={false}
                            render={<Link href={`/admin/reports/${report.id}`} />}
                          >
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Voir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}