"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ClipboardCheck, Database, LockKeyhole, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

const trustPanels = [
  {
    title: "How blockchain protects records",
    detail:
      "BEJAS keeps full justice records in controlled databases while anchoring proof and workflow integrity checks for public verification.",
    Icon: ShieldCheck,
  },
  {
    title: "What the public can see",
    detail:
      "The portal shows safe summaries, broad case stages, public notices, and aggregated transparency statistics without exposing protected evidence.",
    Icon: ClipboardCheck,
  },
  {
    title: "What stays restricted",
    detail:
      "Witness statements, victim addresses, suspect-sensitive data, sealed files, confidential notes, and protected evidence remain restricted.",
    Icon: LockKeyhole,
  },
] as const

const quickLinks = [
  { title: "Verify Public Cases", href: "/public/cases" },
  { title: "Open Analytics", href: "/public/analytics" },
  { title: "Read Reports", href: "/public/reports" },
  { title: "Give Public Feedback", href: "/public/feedback?topic=public-comment" },
] as const

function PublicTrustPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Public Trust Layer", st: "Lera la Tshepo ya Setjhaba", fr: "Couche de confiance publique", pt: "Camada de confianca publica", es: "Capa de confianza publica", sw: "Safu ya uaminifu wa umma", ar: "طبقة الثقة العامة", de: "Offentliche Vertrauensebene", zh: "公共信任层", hi: "सार्वजनिक विश्वास परत", ur: "عوامی اعتماد کی تہہ", ru: "Уровень общественного доверия", af: "Openbare vertroulaag" }),
    heroTag: translatePublicValue(language, { en: "Trust And Verification", st: "Tshepo le Netefatso", fr: "Confiance et verification", pt: "Confianca e verificacao", es: "Confianza y verificacion", sw: "Uaminifu na uhakiki", ar: "الثقة والتحقق", de: "Vertrauen und Verifizierung", zh: "信任与验证", hi: "विश्वास और सत्यापन", ur: "اعتماد اور تصدیق", ru: "Доверие и проверка", af: "Vertroue en verifikasie" }),
    heroTitle: translatePublicValue(language, { en: "Public trust, privacy, and record integrity.", st: "Tshepo ya setjhaba, lekunutu, le botshepehi ba lirekoto.", fr: "Confiance publique, confidentialite et integrite des dossiers.", pt: "Confianca publica, privacidade e integridade dos registos.", es: "Confianza publica, privacidad e integridad de registros.", sw: "Uaminifu wa umma, faragha, na uadilifu wa rekodi.", ar: "الثقة العامة والخصوصية وسلامة السجلات.", de: "Offentliches Vertrauen, Datenschutz und Integritat der Akten.", zh: "公共信任、隐私和记录完整性。", hi: "सार्वजनिक विश्वास, गोपनीयता और अभिलेख अखंडता।", ur: "عوامی اعتماد، رازداری، اور ریکارڈ کی سالمیت۔", ru: "Общественное доверие, конфиденциальность и целостность записей.", af: "Openbare vertroue, privaatheid en rekordintegriteit." }),
    sectionLeft: translatePublicValue(language, { en: "Public versus restricted information", st: "Tlhahisoleseding ya setjhaba le e thibetsweng", fr: "Information publique versus restreinte", pt: "Informacao publica versus restrita", es: "Informacion publica frente a restringida", sw: "Taarifa za umma dhidi ya zilizozuiliwa", ar: "المعلومات العامة مقابل المقيدة", de: "Offentliche versus eingeschrankte Informationen", zh: "公开信息与受限信息", hi: "सार्वजनिक बनाम प्रतिबंधित जानकारी", ur: "عوامی بمقابلہ محدود معلومات", ru: "Публичная и ограниченная информация", af: "Openbare teenoor beperkte inligting" }),
    quickActions: translatePublicValue(language, { en: "Quick actions", st: "Diketso tse Potlakileng", fr: "Actions rapides", pt: "Acoes rapidas", es: "Acciones rapidas", sw: "Vitendo vya haraka", ar: "إجراءات سريعة", de: "Schnellaktionen", zh: "快速操作", hi: "त्वरित क्रियाएं", ur: "فوری اقدامات", ru: "Быстрые действия", af: "Vinnige aksies" }),
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
          <Select value={language} onValueChange={(value) => router.push(`/public/trust?lang=${value}`)}>
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
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-400/10">
                  {t.heroTag}
                </Badge>
                <Badge variant="outline" className="border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75">
                  BEJAS Public Portal
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  {t.heroTitle}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                  This page explains how BEJAS protects justice information. Public users can verify safe records and
                  public workflow movement, while confidential evidence and protected identities remain restricted.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {trustPanels.map(({ title, detail, Icon }) => (
                  <div key={title} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-cyan-300/20 bg-cyan-400/10">
                      <Icon className="h-4.5 w-4.5 text-cyan-100" />
                    </div>
                    <div className="mt-4 text-base font-semibold text-white">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/64">{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section id="visibility" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle>{t.sectionLeft}</CardTitle>
              <CardDescription className="text-white/60">
                BEJAS publishes only what is safe for public transparency and service use.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.1rem] border border-cyan-300/16 bg-cyan-400/8 p-4">
                <div className="text-sm font-semibold text-cyan-100">Public-safe information</div>
                <div className="mt-2 text-sm leading-6 text-white/68">
                  Case numbers, broad workflow status, public hearing information where lawful, public summaries,
                  transparency metrics, service reports, and published outcomes.
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Restricted information</div>
                <div className="mt-2 text-sm leading-6 text-white/68">
                  Witness statements, private evidence, internal reasoning, confidential investigations, victim
                  addresses, suspect-sensitive notes, sealed matters, and protected identities.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-200" />
                {t.quickActions}
              </CardTitle>
              <CardDescription className="text-white/60">
                Move from explanation into actual public services.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 transition hover:border-cyan-300/24 hover:bg-white/8 hover:no-underline"
                >
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                  <ArrowRight className="h-4 w-4 text-cyan-100 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default function PublicTrustPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicTrustPageContent />
    </Suspense>
  )
}
