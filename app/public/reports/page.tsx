"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Database, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

const reportCards = [
  {
    title: "Service Performance Reports",
    detail: "Response time, visible workload, stage movement, and backlog-oriented public transparency summaries.",
    href: "/public/analytics?panel=reading",
    Icon: BarChart3,
  },
  {
    title: "Workflow And Status Reports",
    detail: "Stage-by-stage workflow distributions and public-safe status composition across the justice chain.",
    href: "/public/analytics?panel=workflow",
    Icon: Database,
  },
  {
    title: "Integrity And Publication Notes",
    detail: "Public trust explanations, verification logic, and publication standards for safe justice records.",
    href: "/public/trust",
    Icon: ShieldCheck,
  },
] as const

const archiveItems = [
  "Monthly public analytics summary",
  "Quarterly service transparency review",
  "Annual justice modernization report",
  "Court publication and outcome digest",
] as const

function PublicReportsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Reports And Transparency", st: "Ditlaleho le Ponahalo", fr: "Rapports et transparence", pt: "Relatorios e transparencia", es: "Informes y transparencia", sw: "Ripoti na uwazi", ar: "التقارير والشفافية", de: "Berichte und Transparenz", zh: "报告与透明度", hi: "रिपोर्ट और पारदर्शिता", ur: "رپورٹس اور شفافیت", ru: "Отчеты и прозрачность", af: "Verslae en deursigtigheid" }),
    heroTag: translatePublicValue(language, { en: "Public Reports", st: "Ditlaleho tsa Setjhaba", fr: "Rapports publics", pt: "Relatorios publicos", es: "Informes publicos", sw: "Ripoti za umma", ar: "التقارير العامة", de: "Offentliche Berichte", zh: "公共报告", hi: "सार्वजनिक रिपोर्ट", ur: "عوامی رپورٹس", ru: "Публичные отчеты", af: "Openbare verslae" }),
    heroTitle: translatePublicValue(language, { en: "Public reports, dashboards, and modernization reading.", st: "Ditlaleho tsa setjhaba, dashboard, le ditaba tsa ntlafatso.", fr: "Rapports publics, tableaux de bord et modernisation.", pt: "Relatorios publicos, paines e leitura de modernizacao.", es: "Informes publicos, paneles y lectura de modernizacion.", sw: "Ripoti za umma, dashibodi, na usomaji wa maboresho.", ar: "تقارير عامة ولوحات معلومات ومواد التحديث.", de: "Offentliche Berichte, Dashboards und Modernisierungsinhalte.", zh: "公共报告、仪表板和现代化内容。", hi: "सार्वजनिक रिपोर्ट, डैशबोर्ड और आधुनिकीकरण सामग्री।", ur: "عوامی رپورٹس، ڈیش بورڈ، اور جدیدکاری کی معلومات۔", ru: "Публичные отчеты, панели и материалы по модернизации.", af: "Openbare verslae, dashboards en moderniseringslesing." }),
  }
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href={`/public?lang=${language}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Link>
          </Button>
          <Select value={language} onValueChange={(value) => router.push(`/public/reports?lang=${value}`)}>
            <SelectTrigger className="h-10 w-[180px] rounded-full border-white/12 bg-white/5 px-3 text-xs text-white">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {PUBLIC_LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.code}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="border-cyan-300/24 bg-cyan-400/10 text-cyan-100">
            {t.badge}
          </Badge>
        </div>

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardContent className="relative p-6 md:p-8">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(84,199,236,0.16),transparent_58%)]" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-400/10">
                  {t.heroTag}
                </Badge>
                <Badge variant="outline" className="border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75">
                  Transparency Archive
                </Badge>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                This section collects public transparency material for citizens, researchers, and oversight audiences.
                It links analytics, workflow reporting, and trust guidance in one place.
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle>Report categories</CardTitle>
              <CardDescription className="text-white/60">
                Open the major public reporting views already available in the portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {reportCards.map(({ title, detail, href, Icon }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-[1.15rem] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/24 hover:bg-white/8 hover:no-underline"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-cyan-300/20 bg-cyan-400/10">
                      <Icon className="h-4.5 w-4.5 text-cyan-100" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-semibold text-white">{title}</div>
                        <ArrowRight className="h-4 w-4 text-cyan-100 transition group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-2 text-sm leading-6 text-white/64">{detail}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-cyan-200" />
                Report archive
              </CardTitle>
              <CardDescription className="text-white/60">
                Suggested report families for the public-facing BEJAS archive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {archiveItems.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-100">
                    {index + 1}
                  </div>
                  <div className="text-sm text-white/78">{item}</div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                  <Link href="/api/public/reports/pack?pack=transparency">
                    Download Transparency Pack
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Link href="/api/public/reports/pack?pack=outcomes">
                    Download Outcomes Pack
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default function PublicReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicReportsPageContent />
    </Suspense>
  )
}
