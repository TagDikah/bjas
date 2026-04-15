"use client"

import Link from "next/link"
import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, FileWarning, Search, Send } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

function PublicComplaintsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const [form, setForm] = useState({ type: "Service complaint", name: "", email: "", caseRef: "", message: "" })
  const [trackingLookup, setTrackingLookup] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const canSubmit = useMemo(() => form.message.trim().length > 0, [form.message])
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Complaints And Tracking", st: "Ditletlebo le ho Sala Morao", fr: "Plaintes et suivi", pt: "Reclamacoes e acompanhamento", es: "Quejas y seguimiento", sw: "Malalamiko na ufuatiliaji", ar: "الشكاوى والمتابعة", de: "Beschwerden und Nachverfolgung", zh: "投诉与跟踪", hi: "शिकायतें और ट्रैकिंग", ur: "شکایات اور ٹریکنگ", ru: "Жалобы и отслеживание", af: "Klagtes en nasporing" }),
    submitTab: translatePublicValue(language, { en: "Submit", st: "Romela", fr: "Soumettre", pt: "Enviar", es: "Enviar", sw: "Wasilisha", ar: "إرسال", de: "Senden", zh: "提交", hi: "जमा करें", ur: "جمع کریں", ru: "Отправить", af: "Dien in" }),
    trackTab: translatePublicValue(language, { en: "Track", st: "Sala Morao", fr: "Suivre", pt: "Rastrear", es: "Rastrear", sw: "Fuatilia", ar: "تتبع", de: "Verfolgen", zh: "跟踪", hi: "ट्रैक करें", ur: "ٹریک کریں", ru: "Отследить", af: "Volg" }),
    submitTitle: translatePublicValue(language, { en: "Submit a public complaint or report", st: "Romela tletlebo kapa tlaleho ya setjhaba", fr: "Soumettre une plainte ou un rapport public", pt: "Enviar uma reclamacao ou relatorio publico", es: "Enviar una queja o informe publico", sw: "Wasilisha malalamiko au ripoti ya umma", ar: "إرسال شكوى أو بلاغ عام", de: "Offentliche Beschwerde oder Meldung einreichen", zh: "提交公共投诉或报告", hi: "सार्वजनिक शिकायत या रिपोर्ट जमा करें", ur: "عوامی شکایت یا رپورٹ جمع کریں", ru: "Подать публичную жалобу или сообщение", af: "Dien 'n openbare klagte of verslag in" }),
    submitDesc: translatePublicValue(language, { en: "Use this for service issues, public record discrepancies, and portal-related concerns.", st: "Sena se sebediswa bakeng sa mathata a tshebeletso, diphapang tsa lirekoto tsa setjhaba, le dingongoreho tsa portal.", fr: "Utilisez ceci pour les problemes de service, les divergences de dossier public et les questions du portail.", pt: "Use isto para problemas de servico, discrepancias em registos publicos e questoes do portal.", es: "Use esto para problemas de servicio, discrepancias en registros publicos y asuntos del portal.", sw: "Tumia hili kwa matatizo ya huduma, tofauti za rekodi za umma, na masuala ya portal.", ar: "استخدم هذا لمشكلات الخدمة وتعارضات السجلات العامة ومشكلات البوابة.", de: "Nutzen Sie dies fur Serviceprobleme, Abweichungen in offentlichen Datensatzen und Portalfragen.", zh: "用于服务问题、公共记录差异和门户相关问题。", hi: "इसे सेवा समस्याओं, सार्वजनिक रिकॉर्ड अंतर और पोर्टल संबंधी मुद्दों के लिए उपयोग करें।", ur: "اسے سروس مسائل، عوامی ریکارڈ اختلافات، اور پورٹل خدشات کے لیے استعمال کریں۔", ru: "Используйте это для проблем обслуживания, расхождений в публичных данных и вопросов по порталу.", af: "Gebruik dit vir dienskwessies, verskille in openbare rekords en portaalprobleme." }),
    trackTitle: translatePublicValue(language, { en: "Track a public complaint", st: "Sala morao tletlebo ya setjhaba", fr: "Suivre une plainte publique", pt: "Acompanhar uma reclamacao publica", es: "Rastrear una queja publica", sw: "Fuatilia malalamiko ya umma", ar: "تتبع شكوى عامة", de: "Offentliche Beschwerde verfolgen", zh: "跟踪公共投诉", hi: "सार्वजनिक शिकायत ट्रैक करें", ur: "عوامی شکایت کو ٹریک کریں", ru: "Отследить публичную жалобу", af: "Volg 'n openbare klagte" }),
    trackDesc: translatePublicValue(language, { en: "Enter a public tracking number to follow the handling stage.", st: "Kenya nomoro ya ho sala morao ya setjhaba ho latela boemo ba tshebetso.", fr: "Entrez un numero de suivi public pour suivre l'etape de traitement.", pt: "Introduza um numero publico para acompanhar a fase de tratamento.", es: "Ingrese un numero publico para seguir la etapa de tramitacion.", sw: "Weka nambari ya ufuatiliaji wa umma kufuatilia hatua ya ushughulikiaji.", ar: "ادخل رقم تتبع عام لمتابعة مرحلة المعالجة.", de: "Geben Sie eine offentliche Trackingnummer ein, um den Bearbeitungsstand zu verfolgen.", zh: "输入公共跟踪编号以查看处理阶段。", hi: "प्रसंस्करण चरण देखने के लिए सार्वजनिक ट्रैकिंग नंबर दर्ज करें।", ur: "کارروائی کے مرحلے کو دیکھنے کے لیے عوامی ٹریکنگ نمبر درج کریں۔", ru: "Введите публичный номер отслеживания, чтобы увидеть этап обработки.", af: "Voer 'n openbare naspornommer in om die hanteringsfase te volg." }),
    submitButton: translatePublicValue(language, { en: "Submit Complaint", st: "Romela Tletlebo", fr: "Soumettre la plainte", pt: "Enviar reclamacao", es: "Enviar queja", sw: "Wasilisha malalamiko", ar: "إرسال الشكوى", de: "Beschwerde senden", zh: "提交投诉", hi: "शिकायत जमा करें", ur: "شکایت جمع کریں", ru: "Отправить жалобу", af: "Dien klagte in" }),
    trackButton: translatePublicValue(language, { en: "Track", st: "Sala Morao", fr: "Suivre", pt: "Rastrear", es: "Rastrear", sw: "Fuatilia", ar: "تتبع", de: "Verfolgen", zh: "跟踪", hi: "ट्रैक करें", ur: "ٹریک کریں", ru: "Отследить", af: "Volg" }),
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submitComplaint() {
    const kindMap: Record<string, string> = {
      "Service complaint": "service_complaint",
      "Discrepancy report": "discrepancy_report",
      "Service suggestion": "service_suggestion",
      "Help request": "help_request",
    }
    const response = await fetch("/api/public/portal/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: kindMap[form.type] || "service_complaint",
        title: form.type,
        message: form.message,
        personName: form.name,
        email: form.email,
        caseReference: form.caseRef,
        language,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (data?.ok) {
      setTrackingNumber(data.submission?.trackingNumber || "")
      setSubmitted(true)
    }
  }

  async function lookupTracking() {
    if (!trackingLookup.trim()) return
    const response = await fetch(`/api/public/portal/submissions/${encodeURIComponent(trackingLookup.trim())}`)
    const data = await response.json().catch(() => ({}))
    setTrackingResult(data?.ok ? data.submission : null)
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
          <Select value={language} onValueChange={(value) => router.push(`/public/complaints?lang=${value}`)}>
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

        <Tabs defaultValue="submit" className="space-y-4">
          <TabsList className="grid h-auto grid-cols-2 rounded-[1rem] bg-white/5 p-1 text-white md:w-[420px]">
            <TabsTrigger value="submit" className="rounded-[0.8rem] data-[state=active]:bg-cyan-400/10 data-[state=active]:text-white">{t.submitTab}</TabsTrigger>
            <TabsTrigger value="track" className="rounded-[0.8rem] data-[state=active]:bg-cyan-400/10 data-[state=active]:text-white">{t.trackTab}</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
                <CardHeader>
                  <CardTitle>{t.submitTitle}</CardTitle>
                  <CardDescription className="text-white/60">
                    {t.submitDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submitted ? <div className="rounded-[1.1rem] border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm leading-6 text-white/76">Submission recorded. Tracking number: <span className="font-semibold text-white">{trackingNumber}</span></div> : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label className="text-white/76">Submission type</Label><Input value={form.type} onChange={(e) => setField("type", e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
                    <div className="space-y-2"><Label className="text-white/76">Case reference</Label><Input value={form.caseRef} onChange={(e) => setField("caseRef", e.target.value)} placeholder="Optional case number" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" /></div>
                    <div className="space-y-2"><Label className="text-white/76">Name</Label><Input value={form.name} onChange={(e) => setField("name", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" /></div>
                    <div className="space-y-2"><Label className="text-white/76">Email</Label><Input value={form.email} onChange={(e) => setField("email", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/76">Describe the complaint or discrepancy</Label>
                    <Textarea rows={6} value={form.message} onChange={(e) => setField("message", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" placeholder="Explain the service issue, tracking problem, or public record discrepancy." />
                  </div>
                  <Button disabled={!canSubmit} onClick={submitComplaint} className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                    <Send className="mr-2 h-4 w-4" />
                    {t.submitButton}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-cyan-200" />
                    Supported public submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-white/68">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Service complaints about delays, missing updates, or access problems.</div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Discrepancy reports where a public case summary appears incorrect or incomplete.</div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Suggestions for transparency, notifications, accessibility, and public portal improvements.</div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="track">
            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
              <CardHeader>
                <CardTitle>{t.trackTitle}</CardTitle>
                <CardDescription className="text-white/60">
                  {t.trackDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input value={trackingLookup} onChange={(e) => setTrackingLookup(e.target.value)} placeholder="Enter tracking number" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                  <Button onClick={lookupTracking} className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                    <Search className="mr-2 h-4 w-4" />
                    {t.trackButton}
                  </Button>
                </div>
                {trackingResult ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">Tracking</div><div className="mt-2 text-lg font-semibold text-white">{trackingResult.trackingNumber}</div></div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">Current stage</div><div className="mt-2 text-lg font-semibold text-white">{trackingResult.moderationStatus}</div></div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">Latest note</div><div className="mt-2 text-sm leading-6 text-white/72">{trackingResult.moderationNotes || "Submission recorded and awaiting action."}</div></div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function PublicComplaintsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicComplaintsPageContent />
    </Suspense>
  )
}
