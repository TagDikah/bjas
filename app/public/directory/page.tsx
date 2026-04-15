"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  FileCheck2,
  FileSearch,
  Gavel,
  Globe2,
  MessageSquare,
  Search,
  ShieldCheck,
  Siren,
  Workflow,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

const portalSections = [
  { title: "Trust and verification", description: "Explain blockchain integrity, privacy, visibility rules, and safe public verification.", href: "/public/trust", Icon: ShieldCheck },
  { title: "Case verification and search", description: "Search by case number, verify public-safe movement, and inspect public-facing integrity signals.", href: "/public/verify", Icon: Search },
  { title: "Analytics and workflow", description: "Open public dashboards for workload, workflow stages, department visibility, and recent movement.", href: "/public/analytics", Icon: Workflow },
  { title: "Court outcomes archive", description: "See published outcomes, court-oriented statuses, and public finalization summaries.", href: "/public/outcomes", Icon: Gavel },
  { title: "Complaints and submissions", description: "Submit service complaints, discrepancy reports, and public-facing feedback with tracking intent.", href: "/public/complaints", Icon: FileSearch },
  { title: "Comments and participation", description: "Allow moderated public comments on reports, notices, dashboards, and reform-oriented pages.", href: "/public/feedback", Icon: MessageSquare },
  { title: "Moderation workspace", description: "Review stored public submissions, publish safe comments, and reject unsafe entries.", href: "/public/moderation", Icon: ShieldCheck },
  { title: "Help and legal explainers", description: "Provide FAQs, service directory details, portal guidance, and plain-language process explanation.", href: "/public/help", Icon: BookOpen },
  { title: "Safety intelligence", description: "Show public-safe category signals, hotspot-style awareness, and district-level intelligence summaries.", href: "/public/safety", Icon: Siren },
  { title: "Reports and transparency", description: "Collect public reports, modernization reading, service transparency, and publication archives.", href: "/public/reports", Icon: BarChart3 },
  { title: "Open data and research", description: "Offer anonymized downloads, researcher channels, public datasets, and media-ready summaries.", href: "/public/open-data", Icon: Globe2 },
  { title: "Published cases and public list", description: "Browse the public case list and open the public-safe case record pages.", href: "/public/cases", Icon: FileCheck2 },
] as const

function PublicDirectoryPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Full Portal Directory", st: "Tataiso e Felletseng ya Portal", fr: "Repertoire complet du portail", pt: "Diretorio completo do portal", es: "Directorio completo del portal", sw: "Orodha kamili ya portal", ar: "دليل البوابة الكامل", de: "Vollstandiges Portalverzeichnis", zh: "完整门户目录", hi: "पूर्ण पोर्टल निर्देशिका", ur: "پورٹل کی مکمل فہرست", ru: "Полный каталог портала", af: "Volledige portaalgids" }),
    heroTag: translatePublicValue(language, { en: "BEJAS Public Blueprint", st: "Moralo wa Setjhaba wa BEJAS", fr: "Plan public BEJAS", pt: "Plano publico do BEJAS", es: "Plano publico de BEJAS", sw: "Mpango wa umma wa BEJAS", ar: "مخطط BEJAS العام", de: "Offentlicher BEJAS-Plan", zh: "BEJAS 公共蓝图", hi: "BEJAS सार्वजनिक रूपरेखा", ur: "BEJAS عوامی خاکہ", ru: "Публичная схема BEJAS", af: "BEJAS openbare bloudruk" }),
    heroTag2: translatePublicValue(language, { en: "Justice Services Directory", st: "Tataiso ya Ditshebeletso tsa Toka", fr: "Repertoire des services de justice", pt: "Diretorio de servicos de justica", es: "Directorio de servicios de justicia", sw: "Orodha ya huduma za haki", ar: "دليل خدمات العدالة", de: "Verzeichnis der Justizdienste", zh: "司法服务目录", hi: "न्याय सेवाओं की निर्देशिका", ur: "انصافی خدمات کی فہرست", ru: "Каталог судебных услуг", af: "Gids vir regsdienste" }),
    heroTitle: translatePublicValue(language, { en: "The full public-facing justice portal structure.", st: "Sebopeho se felletseng sa portal ya setjhaba ya toka.", fr: "La structure complete du portail public de justice.", pt: "A estrutura completa do portal publico de justica.", es: "La estructura completa del portal publico de justicia.", sw: "Muundo kamili wa portal ya umma ya haki.", ar: "الهيكل الكامل لبوابة العدالة العامة.", de: "Die vollstandige Struktur des offentlichen Justizportals.", zh: "完整的面向公众的司法门户结构。", hi: "सार्वजनिक न्याय पोर्टल की पूर्ण संरचना।", ur: "عوامی انصافی پورٹل کا مکمل ڈھانچہ۔", ru: "Полная структура публичного судебного портала.", af: "Die volledige struktuur van die openbare regsportaal." }),
    heroBody: translatePublicValue(language, { en: "This directory groups the major public portal sections around trust, verification, analytics, public participation, outcomes, complaints, open data, and citizen help.", st: "Tataiso ena e bokella dikarolo tse kgolo tsa portal mabapi le tshepo, netefatso, analytics, karolo ya setjhaba, diphetho, ditletlebo, data e bulehileng, le thuso ya baahi.", fr: "Ce repertoire regroupe les sections majeures du portail autour de la confiance, de la verification, des analyses, de la participation, des resultats, des plaintes, des donnees ouvertes et de l'aide citoyenne.", pt: "Este diretorio agrupa as principais secoes do portal em confianca, verificacao, analise, participacao publica, resultados, reclamacoes, dados abertos e ajuda ao cidadao.", es: "Este directorio agrupa las principales secciones del portal en confianza, verificacion, analitica, participacion publica, resultados, quejas, datos abiertos y ayuda ciudadana.", sw: "Orodha hii inaunganisha sehemu kuu za portal kuhusu uaminifu, uthibitisho, uchambuzi, ushiriki wa umma, matokeo, malalamiko, data wazi, na msaada kwa wananchi.", ar: "يجمع هذا الدليل الأقسام الرئيسية للبوابة حول الثقة والتحقق والتحليلات والمشاركة العامة والنتائج والشكاوى والبيانات المفتوحة ومساعدة المواطنين.", de: "Dieses Verzeichnis gruppiert die wichtigsten Portalbereiche rund um Vertrauen, Verifizierung, Analysen, Beteiligung, Ergebnisse, Beschwerden, offene Daten und Hilfe fur Burger.", zh: "此目录汇总了门户的主要部分，包括信任、验证、分析、公众参与、结果、投诉、开放数据和公民帮助。", hi: "यह निर्देशिका पोर्टल के मुख्य भागों को विश्वास, सत्यापन, विश्लेषण, सार्वजनिक भागीदारी, परिणाम, शिकायतें, खुला डेटा और नागरिक सहायता के आसपास समूहित करती है।", ur: "یہ فہرست پورٹل کے بڑے حصوں کو اعتماد، تصدیق، تجزیات، عوامی شرکت، نتائج، شکایات، اوپن ڈیٹا، اور شہری مدد کے گرد جمع کرتی ہے۔", ru: "Этот каталог объединяет основные разделы портала: доверие, проверка, аналитика, участие общественности, результаты, жалобы, открытые данные и помощь гражданам.", af: "Hierdie gids groepeer die belangrikste portaalafdelings rondom vertroue, verifikasie, analise, openbare deelname, uitkomste, klagtes, oop data en burgerhulp." }),
    open: translatePublicValue(language, { en: "Open", st: "Bula", fr: "Ouvrir", pt: "Abrir", es: "Abrir", sw: "Fungua", ar: "افتح", de: "Offnen", zh: "打开", hi: "खोलें", ur: "کھولیں", ru: "Открыть", af: "Maak oop" }),
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
          <Select value={language} onValueChange={(value) => router.push(`/public/directory?lang=${value}`)}>
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
          <CardContent className="p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-400/10">
                  {t.heroTag}
                </Badge>
                <Badge variant="outline" className="border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75">
                  {t.heroTag2}
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                {t.heroBody}
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portalSections.map(({ title, description, href, Icon }) => (
            <Link
              key={title}
              href={`${href}?lang=${language}`}
              className="group rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] p-5 text-white shadow-[0_20px_60px_rgba(4,10,28,0.24)] transition hover:border-cyan-300/24 hover:bg-[linear-gradient(180deg,rgba(19,31,58,0.97),rgba(12,20,42,0.99))] hover:no-underline"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-cyan-300/20 bg-cyan-400/10">
                <Icon className="h-5 w-5 text-cyan-100" />
              </div>
              <div className="mt-4 text-lg font-semibold text-white">{title}</div>
              <div className="mt-2 text-sm leading-6 text-white/64">{description}</div>
              <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-100 transition group-hover:text-white">
                {t.open}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}

export default function PublicDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicDirectoryPageContent />
    </Suspense>
  )
}
