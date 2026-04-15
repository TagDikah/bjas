"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowRight,
  Archive,
  ArrowLeft,
  BarChart2,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Database,
  FolderKanban,
  Gavel,
  Globe2,
  Landmark,
  MapPinned,
  Search,
  Send,
  FileSearch,
  ShieldCheck,
  Users2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import {
  computePublicDashboardStats,
  mergePublicCases,
  toPublicCases,
  type PublicCaseView,
} from "@/lib/public-case-tracking"

type WorkflowBucket = {
  order: number
  officeKey: string
  officeLabel: string
}

type OfficeCardDefinition = {
  key: string
  label: string
  subtitle: string
  accentClass: string
  Icon: LucideIcon
  pendingStatuses: string[]
  activeStatuses: string[]
  stageOrder: number
}

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "st", label: "Sesotho" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "es", label: "Spanish" },
  { code: "sw", label: "Swahili" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "ru", label: "Russian" },
  { code: "af", label: "Afrikaans" },
] as const

const EN_SERVICE_CARDS = [
  { title: "Case Verification", note: "Search by case number and confirm public-facing progress." },
  { title: "Transparency Reports", note: "Open service reports, public metrics, and justice modernization reading." },
  { title: "Public Comment", note: "Submit comments and feedback on reports, services, and public reform pages." },
  { title: "Service Complaint", note: "Report service issues, missing updates, or public-facing case discrepancies." },
  { title: "Portal Directory", note: "Open the full public portal structure and browse every major citizen-facing section." },
] as const

const EN_SECTION_LABELS = [
  "Dashboard Reading",
  "Workflow Snapshot",
  "Case Locations",
  "Office Workload",
  "Status Breakdown",
  "Recent Movements",
] as const

const EN_TRUST_CARDS = [
  { title: "Integrity Verification", detail: "See how blockchain proof protects public case summaries without exposing restricted justice data." },
  { title: "Public Visibility Rules", detail: "Read what the public can see, what stays restricted, and why privacy controls matter in justice systems." },
  { title: "Verification Search", detail: "Search public case references and verify current public-safe movement and status." },
] as const

const EN_PARTICIPATION_CARDS = [
  { title: "Comment on Public Reports", detail: "Citizens can comment on reports, dashboards, notices, and consultation pages. Active cases stay protected." },
  { title: "Report a Discrepancy", detail: "Flag a missing update, incorrect public summary, or a publication issue for review." },
  { title: "Justice Service Suggestions", detail: "Submit ideas for service delivery, notifications, accessibility, or portal improvements." },
] as const

const EN_TRANSPARENCY_HIGHLIGHTS = [
  { label: "Integrity checks passed", detail: "Public-facing records that currently align with visible workflow integrity expectations." },
  { label: "Departments visible", detail: "Distinct public offices currently represented in the portal view." },
  { label: "Latest movement feed", detail: "Recent public-safe record movements available for citizens to inspect." },
] as const

function makeCopy(overrides: Partial<any>) {
  return {
    badge: "Public Tracking",
    heroTitle: "Public Case Tracking Dashboard",
    heroBody:
      "View the total number of public cases, see where cases are in the justice workflow, and follow the latest updates without opening each record one by one.",
    noLogin: "No Login Needed",
    directory: "Open Full Directory",
    searchPlaceholder: "Search case number or title",
    searchCases: "Search Cases",
    openAnalytics: "Open Analytics",
    visibleCases: "Visible Cases",
    visibleCasesDetail: "Current public records available to citizens.",
    inMotion: "In Motion",
    inMotionDetail: "Records still moving through visible workflow stages.",
    leadOffice: "Lead Office",
    noCasesYet: "No cases yet",
    leadOfficeDetail: (count: number) => `${count} visible cases are currently centered here.`,
    leadOfficeEmpty: "Location summary will appear once cases are available.",
    quickAccessTitle: "Quick Access",
    quickAccessDescription: "Open the main public services directly without digging through the whole dashboard.",
    exploreTitle: "Explore The Dashboard",
    exploreDescription: "Open one focused analytics view at a time. Each tile takes you to a different reading of the public workload.",
    trustTitle: "Trust And Verification",
    trustDescription: "Understand what is visible, protected, and verifiable.",
    participationTitle: "Participation And Integrity",
    participationDescription: "Public feedback, safe participation, and operational trust signals.",
    portalDirectionTitle: "Portal Direction",
    portalDirectionBody: "Safe verification, public tracking, reports, complaints, and moderated participation.",
    reports: "Reports",
    openService: "Open Service",
    open: "Open",
    focusedView: "Focused View",
    openSection: "Open Section",
    itemsReady: (count: number) => `${count} items ready to open`,
    serviceCards: EN_SERVICE_CARDS,
    sectionLabels: EN_SECTION_LABELS,
    trustCards: EN_TRUST_CARDS,
    participationCards: EN_PARTICIPATION_CARDS,
    transparencyHighlights: EN_TRANSPARENCY_HIGHLIGHTS,
    ...overrides,
  }
}

const LANGUAGE_COPIES: Record<string, any> = {
  en: makeCopy({}),
  st: makeCopy({
    badge: "Tlhahlobo ya Setjhaba",
    heroTitle: "Dashboard ya ho sala morao dinyeoe tsa setjhaba",
    heroBody:
      "Sheba palo ya dinyeoe tsa setjhaba, o bone moo di leng teng tsamaisong ya toka, mme o latele dintlafatso tsa moraorao ntle le ho bula rekoto ka nngwe.",
    noLogin: "Ha ho hloke ho kena",
    directory: "Tataiso e Felletseng",
    searchPlaceholder: "Batla nomoro ya nyeoe kapa sehlooho",
    searchCases: "Batla Dinyeoe",
    openAnalytics: "Bula Analytics",
    visibleCases: "Dinyeoe Tse Bonahalang",
    visibleCasesDetail: "Lirekoto tsa setjhaba tse fumanehang ho baahi hajoale.",
    inMotion: "Tse Tsamayang",
    inMotionDetail: "Lirekoto tse ntseng di tswela pele mehatong e bonahalang ya mosebetsi.",
    leadOffice: "Ofisi e Etellang Pele",
    noCasesYet: "Ha ho dinyeoe hajoale",
    leadOfficeDetail: (count: number) => `${count} dinyeoe tse bonahalang di tsepamisitswe mona hajoale.`,
    leadOfficeEmpty: "Kakaretso ya sebaka e tla hlaha hang ha dinyeoe di se di fumaneha.",
    quickAccessTitle: "Phihlello e Potlakileng",
    quickAccessDescription: "Bula ditshebeletso tsa bohlokwa tsa setjhaba ka kotloloho ntle le ho cheka dashboard kaofela.",
    exploreTitle: "Hlahloba Dashboard",
    exploreDescription: "Bula pono e le nngwe ya analytics ka nako. Karete ka nngwe e isa ponong e fapaneng ya mojaro wa setjhaba.",
    trustTitle: "Tshepo le Netefatso",
    trustDescription: "Utloisisa se bonahalang, se sireleditsweng, le se ka netefatswang.",
    participationTitle: "Kenyelletso le Botshepehi",
    participationDescription: "Maikutlo a setjhaba, karolo e sireletsehileng, le matshwao a tshepo ya tshebetso.",
    portalDirectionTitle: "Tataiso ya Portal",
    portalDirectionBody: "Netefatso e sireletsehileng, ho sala morao, ditlaleho, ditletlebo, le karolo e laolwang ya setjhaba.",
    reports: "Ditlaleho",
    openService: "Bula Tshebeletso",
    open: "Bula",
    focusedView: "Pono e Tsepamisitsweng",
    openSection: "Bula Karolo",
    itemsReady: (count: number) => `${count} dintho di loketse ho bulwa`,
    serviceCards: [
      { title: "Netefatso ya Nyeoe", note: "Batla ka nomoro ya nyeoe mme o netefatse tsoelo-pele e bonahalang ho setjhaba." },
      { title: "Ditlaleho tsa Ponahalo", note: "Bula ditlaleho tsa ditshebeletso, dipalo tsa setjhaba, le ditaba tsa ntlafatso ya toka." },
      { title: "Maikutlo a Setjhaba", note: "Romela maikutlo le ditshwaelo mabapi le ditlaleho, ditshebeletso, le maqephe a diphetoho tsa setjhaba." },
      { title: "Tletlebo ya Tshebeletso", note: "Tlaleha mathata a tshebeletso, dintlafatso tse haellang, kapa diphapang tsa dintlha tsa setjhaba." },
      { title: "Tataiso ya Portal", note: "Bula sebopeho sohle sa portal ya setjhaba mme o shebe dikarolo tsohle tse kgolo tsa baahi." },
    ],
    sectionLabels: ["Kakaretso ya Dashboard", "Setshwantsho sa Tsamaiso", "Mafelo a Dinyeoe", "Mojaro wa Diofisi", "Kabo ya Maemo", "Metsamao ya Moraorao"],
    trustCards: [
      { title: "Netefatso ya Botshepehi", detail: "Bona kamoo bopaki ba blockchain bo sireletsang kakaretso ya dinyeoe tsa setjhaba ntle le ho pepesa dintlha tse thibetsweng." },
      { title: "Melao ya Ponahalo ya Setjhaba", detail: "Bala seo setjhaba se ka se bonang, se patilweng, le hobaneng taolo ya lekunutu e le bohlokwa tsamaisong ya toka." },
      { title: "Batla Netefatso", detail: "Batla ditshupiso tsa dinyeoe tsa setjhaba mme o netefatse motsamao le boemo bo sireletsehileng ba nyeoe." },
    ],
    participationCards: [
      { title: "Fana ka Maikutlo Ditlalehong", detail: "Baahi ba ka fana ka maikutlo ditlalehong, dashboard, ditsebiso, le maqephe a puisano. Dinyeoe tse phelang di ntse di sireleditswe." },
      { title: "Tlaleha Phapang", detail: "Tshwaya ntlafatso e haellang, kakaretso e fosahetseng ya setjhaba, kapa bothata ba phatlalatso hore bo hlahlojwe." },
      { title: "Ditlhahiso tsa Tshebeletso ya Toka", detail: "Fana ka mehopolo ya ntlafatso ya tshebeletso, ditsebiso, phihlello, kapa ntlafatso ya portal." },
    ],
    transparencyHighlights: [
      { label: "Dinetefatso tsa botshepehi tse fetileng", detail: "Lirekoto tsa setjhaba tse ntseng di dumellana le ditebello tsa botshepehi ba workflow." },
      { label: "Mafapha a bonahalang", detail: "Palo ya diofisi tsa setjhaba tse emetsweng hajoale portaleng." },
      { label: "Lenane la motsamao wa moraorao", detail: "Metsamao ya moraorao ya lirekoto tsa setjhaba e fumanehang hore baahi ba e shebe." },
    ],
  }),
  fr: makeCopy({ badge: "Suivi Public", heroTitle: "Tableau public de suivi des dossiers", noLogin: "Sans connexion", quickAccessTitle: "Acces Rapide", exploreTitle: "Explorer Le Tableau", trustTitle: "Confiance et Verification", participationTitle: "Participation et Integrite", reports: "Rapports", open: "Ouvrir", openSection: "Ouvrir la section" }),
  pt: makeCopy({ badge: "Rastreamento Publico", heroTitle: "Painel publico de acompanhamento de casos", noLogin: "Sem login", quickAccessTitle: "Acesso Rapido", exploreTitle: "Explorar o Painel", trustTitle: "Confianca e Verificacao", participationTitle: "Participacao e Integridade", reports: "Relatorios", open: "Abrir", openSection: "Abrir secao" }),
  es: makeCopy({ badge: "Seguimiento Publico", heroTitle: "Panel publico de seguimiento de casos", noLogin: "Sin inicio de sesion", quickAccessTitle: "Acceso Rapido", exploreTitle: "Explorar el Panel", trustTitle: "Confianza y Verificacion", participationTitle: "Participacion e Integridad", reports: "Informes", open: "Abrir", openSection: "Abrir seccion" }),
  sw: makeCopy({ badge: "Ufuatiliaji wa Umma", heroTitle: "Dashibodi ya umma ya kufuatilia kesi", noLogin: "Hakuna kuingia", quickAccessTitle: "Ufikiaji wa Haraka", exploreTitle: "Chunguza Dashibodi", trustTitle: "Uaminifu na Uhakiki", participationTitle: "Ushiriki na Uadilifu", reports: "Ripoti", open: "Fungua", openSection: "Fungua sehemu" }),
  ar: makeCopy({ badge: "التتبع العام", heroTitle: "لوحة التتبع العامة للقضايا", noLogin: "لا حاجة لتسجيل الدخول", quickAccessTitle: "وصول سريع", exploreTitle: "استكشف اللوحة", trustTitle: "الثقة والتحقق", participationTitle: "المشاركة والنزاهة", reports: "التقارير", open: "فتح", openSection: "فتح القسم" }),
  de: makeCopy({ badge: "Offentliche Verfolgung", heroTitle: "Offentliches Fallverfolgungs-Dashboard", noLogin: "Keine Anmeldung", quickAccessTitle: "Schnellzugriff", exploreTitle: "Dashboard erkunden", trustTitle: "Vertrauen und Verifizierung", participationTitle: "Beteiligung und Integritat", reports: "Berichte", open: "Offnen", openSection: "Bereich offnen" }),
  zh: makeCopy({ badge: "公共跟踪", heroTitle: "公共案件跟踪仪表板", noLogin: "无需登录", quickAccessTitle: "快速入口", exploreTitle: "浏览仪表板", trustTitle: "信任与验证", participationTitle: "参与和完整性", reports: "报告", open: "打开", openSection: "打开部分" }),
  hi: makeCopy({ badge: "सार्वजनिक ट्रैकिंग", heroTitle: "सार्वजनिक केस ट्रैकिंग डैशबोर्ड", noLogin: "लॉगिन की जरूरत नहीं", quickAccessTitle: "त्वरित पहुंच", exploreTitle: "डैशबोर्ड देखें", trustTitle: "विश्वास और सत्यापन", participationTitle: "भागीदारी और अखंडता", reports: "रिपोर्ट", open: "खोलें", openSection: "अनुभाग खोलें" }),
  ur: makeCopy({ badge: "عوامی ٹریکنگ", heroTitle: "عوامی کیس ٹریکنگ ڈیش بورڈ", noLogin: "لاگ ان کی ضرورت نہیں", quickAccessTitle: "فوری رسائی", exploreTitle: "ڈیش بورڈ دیکھیں", trustTitle: "اعتماد اور تصدیق", participationTitle: "شرکت اور دیانت", reports: "رپورٹس", open: "کھولیں", openSection: "سیکشن کھولیں" }),
  ru: makeCopy({ badge: "Публичное отслеживание", heroTitle: "Публичная панель отслеживания дел", noLogin: "Без входа", quickAccessTitle: "Быстрый доступ", exploreTitle: "Обзор панели", trustTitle: "Доверие и проверка", participationTitle: "Участие и целостность", reports: "Отчеты", open: "Открыть", openSection: "Открыть раздел" }),
  af: makeCopy({ badge: "Openbare Nasporing", heroTitle: "Openbare saaknasporing-paneel", noLogin: "Geen aanmelding nodig", quickAccessTitle: "Vinnige Toegang", exploreTitle: "Verken die Paneel", trustTitle: "Vertroue en Verifikasie", participationTitle: "Deelname en Integriteit", reports: "Verslae", open: "Open", openSection: "Open afdeling" }),
}

function normalizeStatus(status: string) {
  return String(status || "").trim().toLowerCase()
}

function includesStatus(status: string, statuses: string[]) {
  return statuses.includes(normalizeStatus(status))
}

function getWorkflowBucket(status: string): WorkflowBucket {
  const current = normalizeStatus(status)

  if (includesStatus(current, ["opened", "draft_police", "open", "pending_intake"])) {
    return { order: 1, officeKey: "hq", officeLabel: "HQ Intake" }
  }

  if (includesStatus(current, ["pending_investigation", "in_investigation", "under_investigation", "evidence_collection", "back_in_process", "returned_to_police"])) {
    return { order: 2, officeKey: "investigation", officeLabel: "Investigation Department" }
  }

  if (includesStatus(current, ["pending_review", "pending_commissioner", "submitted_to_commissioner", "commissioner_clarification", "re_submitted", "sent_back_for_correction", "rejected"])) {
    return { order: 3, officeKey: "commissioner", officeLabel: "Commissioner Review" }
  }

  if (includesStatus(current, ["approved", "submitted_to_dpp", "submitted_to_prosecution_registry", "delivered_to_dpp"])) {
    return { order: 4, officeKey: "dpp_office", officeLabel: "DPP Office" }
  }

  if (includesStatus(current, ["dpp_registry_intake", "registered_by_prosecution_registry"])) {
    return { order: 5, officeKey: "dpp_registry", officeLabel: "DPP Registry" }
  }

  if (includesStatus(current, ["assigned_to_prosecutor"])) {
    return { order: 6, officeKey: "prosecutor", officeLabel: "DPP Prosecutor" }
  }

  if (includesStatus(current, ["filed_to_high_court", "filed_to_small_court", "delivered_to_court"])) {
    return { order: 7, officeKey: "court_filing", officeLabel: "Court Filing" }
  }

  if (includesStatus(current, ["high_court_registry_intake", "assigned_to_court"])) {
    return { order: 8, officeKey: "court_registry", officeLabel: "Court Registry" }
  }

  if (includesStatus(current, ["assigned_to_high_court_judge", "high_court_in_progress"])) {
    return { order: 9, officeKey: "judge", officeLabel: "High Court Judge" }
  }

  if (includesStatus(current, ["assigned_to_small_court_judge", "in_progress"])) {
    return { order: 9, officeKey: "magistrate", officeLabel: "Magistrate" }
  }

  if (includesStatus(current, ["first_appearance", "bail_stage", "trial_in_progress", "judgment_delivered", "sentenced"])) {
    return { order: 10, officeKey: "court_hearing", officeLabel: "Court Hearing" }
  }

  if (includesStatus(current, ["transferred_to_correctional_services", "serving_sentence", "parole_review", "released"])) {
    return { order: 11, officeKey: "correctional_services", officeLabel: "Correctional Services" }
  }

  if (includesStatus(current, ["appealed", "appeal_in_progress", "appeal_decided"])) {
    return { order: 12, officeKey: "appeal", officeLabel: "Appeal / High Court" }
  }

  if (includesStatus(current, ["docket_complete", "completed", "high_court_completed", "small_court_completed", "closed", "case_closed", "case_archived"])) {
    return { order: 13, officeKey: "records", officeLabel: "Docket and Records" }
  }

  return { order: 1, officeKey: "hq", officeLabel: "HQ Intake" }
}

const OFFICE_CARD_DEFINITIONS: OfficeCardDefinition[] = [
  {
    key: "hq",
    label: "HQ Intake",
    subtitle: "Opening and intake queue",
    accentClass: "from-blue-400/22 via-blue-500/12 to-transparent",
    Icon: Building2,
    pendingStatuses: ["pending_intake"],
    activeStatuses: ["opened", "draft_police", "open"],
    stageOrder: 1,
  },
  {
    key: "investigation",
    label: "Investigation",
    subtitle: "Waiting vs active investigation work",
    accentClass: "from-blue-500/20 via-sky-500/10 to-transparent",
    Icon: FileSearch,
    pendingStatuses: ["pending_investigation", "returned_to_police"],
    activeStatuses: ["in_investigation", "under_investigation", "evidence_collection", "back_in_process"],
    stageOrder: 2,
  },
  {
    key: "commissioner",
    label: "Commissioner",
    subtitle: "Review, correction, and approval desk",
    accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
    Icon: ClipboardCheck,
    pendingStatuses: ["pending_review", "pending_commissioner", "submitted_to_commissioner", "re_submitted"],
    activeStatuses: ["commissioner_clarification", "sent_back_for_correction", "rejected"],
    stageOrder: 3,
  },
  {
    key: "dpp_office",
    label: "DPP Office",
    subtitle: "Approved files entering prosecution",
    accentClass: "from-blue-500/20 via-cyan-500/10 to-transparent",
    Icon: Landmark,
    pendingStatuses: ["submitted_to_dpp", "submitted_to_prosecution_registry", "delivered_to_dpp"],
    activeStatuses: ["approved"],
    stageOrder: 4,
  },
  {
    key: "dpp_registry",
    label: "DPP Registry",
    subtitle: "Registration and intake control",
    accentClass: "from-sky-500/20 via-blue-500/10 to-transparent",
    Icon: FolderKanban,
    pendingStatuses: ["dpp_registry_intake"],
    activeStatuses: ["registered_by_prosecution_registry"],
    stageOrder: 5,
  },
  {
    key: "prosecutor",
    label: "DPP Prosecutor",
    subtitle: "Case preparation before court filing",
    accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
    Icon: BriefcaseBusiness,
    pendingStatuses: ["assigned_to_prosecutor"],
    activeStatuses: [],
    stageOrder: 6,
  },
  {
    key: "court_filing",
    label: "To Court",
    subtitle: "Files being taken from DPP to court",
    accentClass: "from-blue-500/20 via-indigo-500/10 to-transparent",
    Icon: Send,
    pendingStatuses: ["filed_to_high_court", "filed_to_small_court"],
    activeStatuses: ["delivered_to_court"],
    stageOrder: 7,
  },
  {
    key: "court_registry",
    label: "Court Registry",
    subtitle: "Registry intake and routing",
    accentClass: "from-blue-400/22 via-blue-500/12 to-transparent",
    Icon: Database,
    pendingStatuses: ["assigned_to_court"],
    activeStatuses: ["high_court_registry_intake"],
    stageOrder: 8,
  },
  {
    key: "registry_assistant",
    label: "Registry Assistant",
    subtitle: "Support load around registry intake",
    accentClass: "from-sky-500/20 via-blue-500/10 to-transparent",
    Icon: Users2,
    pendingStatuses: ["assigned_to_court"],
    activeStatuses: ["high_court_registry_intake"],
    stageOrder: 8,
  },
  {
    key: "judge",
    label: "Judges",
    subtitle: "High court judicial handling",
    accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
    Icon: Gavel,
    pendingStatuses: ["assigned_to_high_court_judge"],
    activeStatuses: ["high_court_in_progress"],
    stageOrder: 9,
  },
  {
    key: "judge_clerk",
    label: "Judge Clerk",
    subtitle: "Support queue around judge-assigned files",
    accentClass: "from-blue-500/20 via-slate-500/10 to-transparent",
    Icon: Users2,
    pendingStatuses: ["assigned_to_high_court_judge"],
    activeStatuses: ["high_court_in_progress"],
    stageOrder: 9,
  },
  {
    key: "court_hearing",
    label: "Court Hearing",
    subtitle: "Appearance, bail, trial, and sentence",
    accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
    Icon: Gavel,
    pendingStatuses: ["first_appearance", "bail_stage"],
    activeStatuses: ["trial_in_progress", "judgment_delivered", "sentenced"],
    stageOrder: 10,
  },
  {
    key: "correctional_services",
    label: "Correctional Services",
    subtitle: "Custody, parole, and release",
    accentClass: "from-blue-500/20 via-cyan-500/10 to-transparent",
    Icon: ShieldCheck,
    pendingStatuses: ["transferred_to_correctional_services", "parole_review"],
    activeStatuses: ["serving_sentence", "released"],
    stageOrder: 11,
  },
  {
    key: "appeal",
    label: "Appeal / High Court",
    subtitle: "Appeal registration, hearing, and outcome",
    accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
    Icon: Landmark,
    pendingStatuses: ["appealed"],
    activeStatuses: ["appeal_in_progress", "appeal_decided"],
    stageOrder: 12,
  },
  {
    key: "magistrate",
    label: "Magistrate",
    subtitle: "Small court and magistrate handling",
    accentClass: "from-blue-500/20 via-sky-500/10 to-transparent",
    Icon: Gavel,
    pendingStatuses: ["assigned_to_small_court_judge"],
    activeStatuses: ["in_progress"],
    stageOrder: 9,
  },
]

function PublicDashboardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeCases = useStore((s: any) => (Array.isArray(s.cases) ? s.cases : []))
  const [publicCases, setPublicCases] = useState<PublicCaseView[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/public/cases")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.publicCases)) {
          setPublicCases(data.publicCases)
        }
      })
      .catch(() => {})
  }, [])

  const mergedPublicCases = useMemo(
    () => mergePublicCases(publicCases, toPublicCases(storeCases)),
    [publicCases, storeCases]
  )

  const stats = useMemo(() => computePublicDashboardStats(mergedPublicCases), [mergedPublicCases])
  const recent = useMemo(
    () => {
      const byCaseNumber = new Map<string, PublicCaseView>()
      for (const item of [...mergedPublicCases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())) {
        const key = String(item.caseNumber || item.caseId || "").trim()
        if (!key || byCaseNumber.has(key)) continue
        byCaseNumber.set(key, item)
      }

      return Array.from(byCaseNumber.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8)
    },
    [mergedPublicCases]
  )

  const statusChartData = useMemo(
    () => stats.byStatus.map((item) => ({ name: item.status, count: item.count })),
    [stats.byStatus]
  )

  const phaseSummary = useMemo(
    () =>
      stats.byPhase
        .map((item) => ({
          ...item,
          percentage: stats.totalCasesOpened ? Math.round((item.count / stats.totalCasesOpened) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count),
    [stats.byPhase, stats.totalCasesOpened]
  )

  const departmentSummary = useMemo(() => {
    const map = new Map<string, { count: number; topStatus: Record<string, number> }>()

    for (const item of mergedPublicCases) {
      const current = map.get(item.department) ?? { count: 0, topStatus: {} }
      current.count += 1
      current.topStatus[item.statusLabel] = (current.topStatus[item.statusLabel] || 0) + 1
      map.set(item.department, current)
    }

    return Array.from(map.entries())
      .map(([department, value]) => {
        const [topStatus, topCount] =
          Object.entries(value.topStatus).sort((a, b) => b[1] - a[1])[0] ?? ["Unknown", 0]

        return {
          department,
          count: value.count,
          topStatus,
          topCount,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [mergedPublicCases])

  const officeSummary = useMemo(
    () =>
      OFFICE_CARD_DEFINITIONS.map((office) => {
        const pending = mergedPublicCases.filter((item) => includesStatus(item.status, office.pendingStatuses)).length
        const active = mergedPublicCases.filter((item) => includesStatus(item.status, office.activeStatuses)).length
        const done = mergedPublicCases.filter((item) => getWorkflowBucket(item.status).order > office.stageOrder).length

        return {
          ...office,
          pending,
          active,
          done,
          total: pending + active,
        }
      }).filter((office) => office.total > 0),
    [mergedPublicCases]
  )

  const casesInMotion =
    stats.totalCasesOpened - stats.totalCompletedDockets - stats.totalClosed
  const intakeCases = phaseSummary.find((item) => item.phase === "Case Opening")?.count ?? 0
  const investigationCases = phaseSummary.find((item) => item.phase === "Investigation")?.count ?? 0
  const prosecutionAndCourtCases =
    (phaseSummary.find((item) => item.phase === "Prosecution / Court Routing")?.count ?? 0) +
    (phaseSummary.find((item) => item.phase === "Court Hearing")?.count ?? 0)
  const reviewCases = phaseSummary.find((item) => item.phase === "Review / Commissioner / Approval")?.count ?? 0
  const latestUpdate = recent[0]
  const reviewPressure = stats.totalRejected + reviewCases
  const leadingOfficeCard = officeSummary
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)[0]
  const meaningfulRecent = recent.filter((item) => item.statusLabel !== "Opened" || item.department !== "HQ")
  const recentFeed = meaningfulRecent.length > 0 ? meaningfulRecent : recent
  const workflowHighlights = useMemo(
    () => [
      {
        label: "Intake",
        value: intakeCases,
        href: "/public/cases?phase=case_opening",
        icon: Building2,
        accent: "from-blue-400/22 via-blue-500/12 to-transparent",
        ring: "border-blue-300/20",
        badge: "Police Opening",
        detail: "Opening, registration, and first capture at police level.",
      },
      {
        label: "Investigation",
        value: investigationCases,
        href: "/public/cases?phase=investigation",
        icon: FileSearch,
        accent: "from-blue-500/20 via-sky-500/10 to-transparent",
        ring: "border-blue-300/20",
        badge: "Evidence Work",
        detail: "Active police investigation, updates, and evidence development.",
      },
      {
        label: "Review",
        value: reviewCases,
        href: "/public/cases?phase=review_approval",
        icon: ClipboardCheck,
        accent: "from-indigo-500/20 via-blue-500/10 to-transparent",
        ring: "border-blue-300/20",
        badge: "Commissioner",
        detail: "Approval, clarification, and return decisions before prosecution.",
      },
      {
        label: "Prosecution / Court",
        value: prosecutionAndCourtCases,
        href: "/public/cases?phase=prosecution_routing",
        icon: Send,
        accent: "from-blue-500/20 via-cyan-500/10 to-transparent",
        ring: "border-blue-300/20",
        badge: "DPP to Court",
        detail: "Files already routed into DPP, prosecution, or court handling.",
      },
      {
        label: "Returned / Rejected",
        value: stats.totalRejected,
        href: "/public/cases?status=rejected",
        icon: XCircle,
        accent: "from-indigo-500/20 via-blue-500/10 to-transparent",
        ring: "border-blue-300/20",
        badge: "Needs Fixes",
        detail: "Cases that cannot move forward until missing issues are corrected.",
      },
      {
        label: "Closed",
        value: stats.totalClosed,
        href: "/public/cases?status=closed",
        icon: Archive,
        accent: "from-blue-500/20 via-slate-500/10 to-transparent",
        ring: "border-blue-300/20",
        badge: "Final State",
        detail: "Cases that have completed the visible justice workflow.",
      },
    ],
    [intakeCases, investigationCases, reviewCases, prosecutionAndCourtCases, stats.totalRejected, stats.totalClosed]
  )
  const panelClass =
    "overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_20px_60px_rgba(4,10,28,0.32)] text-white"
  const subPanelClass =
    "rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_34px_rgba(3,8,20,0.18)]"
  const sectionButtons = [
    { key: "reading", label: "Dashboard Reading", count: 4, href: "/public/analytics?panel=reading", Icon: Activity },
    { key: "workflow", label: "Workflow Snapshot", count: workflowHighlights.length, href: "/public/analytics?panel=workflow", Icon: ClipboardCheck },
    { key: "location", label: "Case Locations", count: phaseSummary.length + Math.min(departmentSummary.length, 6), href: "/public/analytics?panel=location", Icon: MapPinned },
    { key: "workload", label: "Office Workload", count: officeSummary.length, href: "/public/analytics?panel=workload", Icon: Users2 },
    { key: "status", label: "Status Breakdown", count: statusChartData.length, href: "/public/analytics?panel=status", Icon: BarChart3 },
    { key: "recent", label: "Recent Movements", count: recentFeed.length, href: "/public/analytics?panel=recent", Icon: Search },
  ] as const
  const trustCards = [
    {
      title: "Integrity Verification",
      detail: "See how blockchain proof protects public case summaries without exposing restricted justice data.",
      href: "/public/trust",
      Icon: ShieldCheck,
    },
    {
      title: "Public Visibility Rules",
      detail: "Read what the public can see, what stays restricted, and why privacy controls matter in justice systems.",
      href: "/public/trust#visibility",
      Icon: ClipboardCheck,
    },
    {
      title: "Verification Search",
      detail: "Search public case references and verify current public-safe movement and status.",
      href: "/public/cases",
      Icon: Search,
    },
  ] as const
  const serviceCards = [
    {
      title: "Case Verification",
      note: "Search by case number and confirm public-facing progress.",
      href: "/public/verify",
      Icon: Search,
    },
    {
      title: "Transparency Reports",
      note: "Open service reports, public metrics, and justice modernization reading.",
      href: "/public/reports",
      Icon: BarChart3,
    },
    {
      title: "Public Comment",
      note: "Submit comments and feedback on reports, services, and public reform pages.",
      href: "/public/feedback?topic=public-comment",
      Icon: Send,
    },
    {
      title: "Service Complaint",
      note: "Report service issues, missing updates, or public-facing case discrepancies.",
      href: "/public/complaints",
      Icon: FileSearch,
    },
    {
      title: "Portal Directory",
      note: "Open the full public portal structure and browse every major citizen-facing section.",
      href: "/public/directory",
      Icon: Globe2,
    },
  ] as const
  const serviceCardStyles = [
    "from-cyan-400/16 via-blue-500/8 to-transparent",
    "from-indigo-400/16 via-cyan-500/8 to-transparent",
    "from-fuchsia-400/16 via-indigo-500/8 to-transparent",
    "from-sky-400/16 via-blue-500/8 to-transparent",
  ] as const
  const sectionCardStyles = [
    "from-cyan-400/18 via-blue-500/8 to-transparent",
    "from-sky-400/18 via-cyan-500/8 to-transparent",
    "from-indigo-400/18 via-blue-500/8 to-transparent",
    "from-blue-400/18 via-sky-500/8 to-transparent",
    "from-fuchsia-400/18 via-indigo-500/8 to-transparent",
    "from-cyan-400/18 via-indigo-500/8 to-transparent",
  ] as const
  const participationCards = [
    {
      title: "Comment on Public Reports",
      detail: "Citizens can comment on reports, dashboards, notices, and consultation pages. Active cases stay protected.",
      href: "/public/feedback?topic=public-comment",
      Icon: Send,
    },
    {
      title: "Report a Discrepancy",
      detail: "Flag a missing update, incorrect public summary, or a publication issue for review.",
      href: "/public/feedback?topic=discrepancy-report",
      Icon: XCircle,
    },
    {
      title: "Justice Service Suggestions",
      detail: "Submit ideas for service delivery, notifications, accessibility, or portal improvements.",
      href: "/public/feedback?topic=service-suggestion",
      Icon: Users2,
    },
  ] as const
  const transparencyHighlights = [
    {
      label: "Integrity checks passed",
      value: `${Math.max(stats.totalCasesOpened - stats.totalRejected, 0)}`,
      detail: "Public-facing records that currently align with visible workflow integrity expectations.",
    },
    {
      label: "Departments visible",
      value: `${departmentSummary.length}`,
      detail: "Distinct public offices currently represented in the portal view.",
    },
    {
      label: "Latest movement feed",
      value: `${recentFeed.length}`,
      detail: "Recent public-safe record movements available for citizens to inspect.",
    },
  ] as const
  const selectedLanguage = searchParams.get("lang") || "en"
  const language = LANGUAGE_COPIES[selectedLanguage] ? selectedLanguage : "en"
  const copy = LANGUAGE_COPIES[language]

  return (
    <PublicDashboardShell
      router={router}
      language={language}
      copy={copy}
      query={query}
      setQuery={setQuery}
      latestUpdate={latestUpdate}
      leadingOfficeCard={leadingOfficeCard}
      stats={stats}
      casesInMotion={casesInMotion}
      reviewPressure={reviewPressure}
      departmentSummary={departmentSummary}
      recentFeed={recentFeed}
      workflowHighlights={workflowHighlights}
      officeSummary={officeSummary}
      sectionButtons={sectionButtons}
      serviceCards={serviceCards}
      trustCards={trustCards}
      participationCards={participationCards}
      transparencyHighlights={transparencyHighlights}
      statusChartData={statusChartData}
      serviceCardStyles={serviceCardStyles}
      sectionCardStyles={sectionCardStyles}
    />
  )
}

function PublicDashboardShell({
  router,
  language,
  copy,
  query,
  setQuery,
  latestUpdate,
  leadingOfficeCard,
  stats,
  casesInMotion,
  reviewPressure,
  departmentSummary,
  recentFeed,
  workflowHighlights,
  officeSummary,
  sectionButtons,
  serviceCards,
  trustCards,
  participationCards,
  transparencyHighlights,
  statusChartData,
  serviceCardStyles,
  sectionCardStyles,
}: any) {
  const panelClass =
    "overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_20px_60px_rgba(4,10,28,0.32)] text-white"
  const subPanelClass =
    "rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_34px_rgba(3,8,20,0.18)]"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-3 py-4 text-white md:px-5 md:py-6">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <aside className="hidden lg:flex lg:w-[86px] lg:flex-col lg:items-center lg:justify-between lg:rounded-[1.8rem] lg:border lg:border-white/10 lg:bg-[linear-gradient(180deg,rgba(9,18,37,0.98),rgba(7,14,29,0.98))] lg:px-3 lg:py-5 lg:shadow-[0_24px_60px_rgba(4,10,28,0.34)]">
          <div className="flex flex-col items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(111,109,255,0.18))] text-lg font-semibold text-white">
              B
            </div>
            {[
              { label: "Overview", Icon: BarChart2, href: "/public" },
              { label: "Cases", Icon: Search, href: "/public/cases" },
              { label: "Analytics", Icon: Activity, href: "/public/analytics" },
              { label: "Reports", Icon: Database, href: "/public/reports" },
              { label: "Trust", Icon: ShieldCheck, href: "/public/trust" },
              { label: "Feedback", Icon: Send, href: "/public/feedback?topic=public-comment" },
            ].map(({ label, Icon, href }, index) => (
              <Link
                key={label}
                href={href}
                className={[
                  "flex w-full flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center text-[11px] transition hover:no-underline",
                  index === 0
                    ? "border-cyan-300/28 bg-[linear-gradient(180deg,rgba(84,199,236,0.18),rgba(111,109,255,0.16))] text-white"
                    : "border-white/6 bg-white/[0.03] text-white/62 hover:border-white/14 hover:bg-white/[0.06] hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl border-cyan-300/20 bg-white/[0.04] px-0 !text-white hover:bg-white/[0.08] hover:!text-white"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
                return
              }
              router.push("/")
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </aside>

        <main className="min-w-0 flex-1 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,40,0.96),rgba(8,15,31,0.98))] shadow-[0_28px_70px_rgba(4,10,28,0.34)]">
          <div className="border-b border-white/8 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100">
                      {copy.badge}
                    </Badge>
                    <Badge variant="outline" className="border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/72">
                      {copy.noLogin}
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      {copy.heroTitle}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
                      {copy.heroBody}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-10 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white lg:hidden"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.length > 1) {
                        router.back()
                        return
                      }
                      router.push("/")
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button asChild size="sm" className="h-10 rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white hover:brightness-110 hover:!text-white">
                    <Link href="/public/reports">{copy.reports}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-10 rounded-[0.95rem] border-white/14 bg-white/5 px-4 !text-white hover:bg-white/10 hover:!text-white">
                    <Link href={`/public/directory?lang=${language}`}>{copy.directory}</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-white/8 pb-3">
                {[
                  { label: "Overview", active: true },
                  { label: copy.exploreTitle, active: false },
                  { label: copy.trustTitle, active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={[
                      "rounded-full border px-4 py-2 text-sm transition",
                      item.active
                        ? "border-cyan-300/28 bg-[linear-gradient(135deg,rgba(84,199,236,0.16),rgba(111,109,255,0.14))] text-white"
                        : "border-white/8 bg-white/[0.02] text-white/56",
                    ].join(" ")}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(180px,1fr))]">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="h-11 rounded-[0.95rem] border-white/10 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] text-white placeholder:text-white/38"
                    />
                    <Button asChild className="h-11 rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white hover:brightness-110 hover:!text-white">
                      <Link href={`/public/cases${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}>
                        <Search className="mr-2 h-4 w-4" />
                        {copy.searchCases}
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" className="h-11 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                      <Link href="/public/analytics">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        {copy.openAnalytics}
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Language</div>
                  <Select value={language} onValueChange={(value) => router.push(`/public?lang=${value}`)}>
                    <SelectTrigger className="mt-2 h-11 rounded-[0.95rem] border-white/12 bg-white/5 px-3 text-xs text-white">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">{copy.leadOffice}</div>
                  <div className="mt-3 text-base font-semibold text-white">
                    {leadingOfficeCard?.label || departmentSummary[0]?.department || copy.noCasesYet}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-white/56">
                    {departmentSummary[0] ? copy.leadOfficeDetail(departmentSummary[0].count) : copy.leadOfficeEmpty}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Latest Movement</div>
                  <div className="mt-3 text-sm font-semibold text-white">
                    {latestUpdate?.statusLabel || "No updates yet"}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-white/56">
                    {latestUpdate?.caseNumber ? `${latestUpdate.caseNumber} · ${latestUpdate.department}` : "The newest visible case activity will appear here."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
            <section className="grid gap-3 xl:grid-cols-4">
              {[
                { label: copy.visibleCases, value: stats.totalCasesOpened, detail: copy.visibleCasesDetail, Icon: Database },
                { label: copy.inMotion, value: casesInMotion, detail: copy.inMotionDetail, Icon: Activity },
                { label: "Review Pressure", value: reviewPressure, detail: "Clarifications, rejections, and review-side load.", Icon: ClipboardCheck },
                { label: "Departments Visible", value: departmentSummary.length, detail: "Distinct public-facing offices represented right now.", Icon: Globe2 },
              ].map(({ label, value, detail, Icon }) => (
                <div key={label} className={`${subPanelClass} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">{label}</div>
                      <div className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</div>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-cyan-300/20 bg-cyan-400/10">
                      <Icon className="h-4 w-4 text-cyan-100" />
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-white/60">{detail}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <Card className={panelClass}>
                <CardHeader className="border-b border-white/8 pb-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">Overview</CardTitle>
                      <CardDescription className="mt-1 text-white/58">{copy.exploreDescription}</CardDescription>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/66">
                      {recentFeed.length} recent movements
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {sectionButtons.map((item, index) => {
                      const Icon = item.Icon
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="group relative overflow-hidden rounded-[1.05rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-3.5 transition hover:border-cyan-300/24 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:no-underline"
                        >
                          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${sectionCardStyles[index]} opacity-90`} />
                          <div className="relative">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border border-cyan-300/20 bg-slate-950/30 shadow-[0_10px_24px_rgba(84,199,236,0.12)]">
                                  <Icon className="h-4 w-4 text-cyan-100" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white">{copy.sectionLabels[index] || item.label}</div>
                                  <div className="mt-1 text-[12px] text-white/58">{copy.itemsReady(item.count)}</div>
                                </div>
                              </div>
                              <Badge variant="outline" className="shrink-0 border-cyan-300/18 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/82">
                                {copy.open}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">Workflow Snapshot</div>
                        <div className="mt-1 text-xs text-white/54">Current visible distribution across the justice process.</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/58">
                        Overview
                      </div>
                    </div>
                    <div className="space-y-3">
                      {workflowHighlights.map((item) => {
                        const Icon = item.icon
                        const maxValue = Math.max(...workflowHighlights.map((entry) => entry.value), 1)
                        const width = Math.max(8, Math.round((item.value / maxValue) * 100))
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="group block rounded-[1rem] border border-white/8 bg-white/[0.035] p-3 transition hover:border-cyan-300/24 hover:bg-white/[0.06] hover:no-underline"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border ${item.ring} bg-slate-950/30`}>
                                  <Icon className="h-4 w-4 text-cyan-100" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white">{item.label}</div>
                                  <div className="mt-1 text-xs leading-5 text-white/56">{item.detail}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-semibold text-white">{item.value}</div>
                                <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/70">{item.badge}</div>
                              </div>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                              <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(84,199,236,0.95),rgba(111,109,255,0.75))]" style={{ width: `${width}%` }} />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className={panelClass}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Recent Movements</CardTitle>
                    <CardDescription className="text-white/58">Latest public-safe changes across visible cases.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentFeed.slice(0, 6).map((item) => (
                      <Link
                        key={`${item.caseId}-${item.updatedAt}`}
                        href={`/public/cases${item.caseNumber ? `?q=${encodeURIComponent(item.caseNumber)}` : ""}`}
                        className="group block rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/24 hover:bg-white/[0.08] hover:no-underline"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{item.caseNumber || item.caseId}</div>
                            <div className="mt-1 text-xs text-cyan-100/74">{item.statusLabel}</div>
                            <div className="mt-2 text-xs leading-5 text-white/56">{item.department}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-cyan-100 transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                <Card className={panelClass}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Office Workload</CardTitle>
                    <CardDescription className="text-white/58">Active queue by visible institution.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {officeSummary.slice(0, 6).map((office) => (
                      <div key={office.key} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{office.label}</div>
                            <div className="mt-1 text-xs text-white/54">{office.subtitle}</div>
                          </div>
                          <div className="text-xl font-semibold text-white">{office.total}</div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2">
                            <div className="text-white/48">Pending</div>
                            <div className="mt-1 font-semibold text-white">{office.pending}</div>
                          </div>
                          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2">
                            <div className="text-white/48">Active</div>
                            <div className="mt-1 font-semibold text-white">{office.active}</div>
                          </div>
                          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2">
                            <div className="text-white/48">Done</div>
                            <div className="mt-1 font-semibold text-white">{office.done}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Card className={panelClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">{copy.quickAccessTitle}</CardTitle>
                  <CardDescription className="text-white/58">{copy.quickAccessDescription}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {serviceCards.map(({ href, Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      className="group relative overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4 transition hover:border-cyan-300/24 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:no-underline"
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${serviceCardStyles[index % serviceCardStyles.length]} opacity-90`} />
                      <div className="relative flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-cyan-300/20 bg-slate-950/30">
                          <Icon className="h-4 w-4 text-cyan-100" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white">{copy.serviceCards[index]?.title || href}</div>
                              <div className="mt-1 text-xs leading-5 text-white/58">{copy.serviceCards[index]?.note}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-cyan-100 transition group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Status Breakdown</CardTitle>
                  <CardDescription className="text-white/58">Snapshot of the most visible case states.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusChartData.slice(0, 7).map((item) => {
                    const maxValue = Math.max(...statusChartData.map((entry) => entry.count), 1)
                    return (
                      <div key={item.name} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-sm font-semibold text-white">{item.count}</div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(84,199,236,0.95),rgba(111,109,255,0.75))]" style={{ width: `${Math.max(8, Math.round((item.count / maxValue) * 100))}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <Card className={`${panelClass} xl:col-span-1`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">{copy.trustTitle}</CardTitle>
                  <CardDescription className="text-white/58">{copy.trustDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trustCards.map(({ href, Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/24 hover:bg-white/[0.08] hover:no-underline"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-cyan-300/20 bg-cyan-400/10">
                        <Icon className="h-4 w-4 text-cyan-100" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{copy.trustCards[index]?.title}</div>
                          <ArrowRight className="h-4 w-4 text-cyan-100 transition group-hover:translate-x-0.5" />
                        </div>
                        <div className="mt-1 text-xs leading-5 text-white/58">{copy.trustCards[index]?.detail}</div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className={`${panelClass} xl:col-span-1`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">{copy.participationTitle}</CardTitle>
                  <CardDescription className="text-white/58">{copy.participationDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {participationCards.map(({ href, Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/24 hover:bg-white/[0.08] hover:no-underline"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-cyan-300/20 bg-cyan-400/10">
                        <Icon className="h-4 w-4 text-cyan-100" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white">{copy.participationCards[index]?.title}</div>
                        <div className="mt-1 text-xs leading-5 text-white/58">{copy.participationCards[index]?.detail}</div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className={`${panelClass} xl:col-span-1`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Integrity Signals</CardTitle>
                  <CardDescription className="text-white/58">Public-facing confidence indicators and system reach.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transparencyHighlights.map((item, index) => (
                    <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">{copy.transparencyHighlights[index]?.label || item.label}</div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{item.value}</div>
                      <div className="mt-2 text-xs leading-5 text-white/62">{copy.transparencyHighlights[index]?.detail || item.detail}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function PublicDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicDashboardPageContent />
    </Suspense>
  )
}
