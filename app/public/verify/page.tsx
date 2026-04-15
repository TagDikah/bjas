"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, QrCode, Search, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

const proofSteps = [
  "Search by public case number or tracking reference.",
  "The portal compares the public-safe record with its anchored proof.",
  "A verification result explains whether the public record remains consistent.",
] as const

function PublicVerifyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const [reference, setReference] = useState("")
  const [documentText, setDocumentText] = useState("")
  const [result, setResult] = useState<any>(null)
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Verification Center", st: "Setsi sa Netefatso", fr: "Centre de verification", pt: "Centro de verificacao", es: "Centro de verificacion", sw: "Kituo cha uthibitisho", ar: "مركز التحقق", de: "Verifizierungszentrum", zh: "验证中心", hi: "सत्यापन केंद्र", ur: "تصدیقی مرکز", ru: "Центр проверки", af: "Verifikasiesentrum" }),
    heroTag: translatePublicValue(language, { en: "Public Verification", st: "Netefatso ya Setjhaba", fr: "Verification publique", pt: "Verificacao publica", es: "Verificacion publica", sw: "Uthibitisho wa umma", ar: "التحقق العام", de: "Offentliche Verifizierung", zh: "公共验证", hi: "सार्वजनिक सत्यापन", ur: "عوامی تصدیق", ru: "Публичная проверка", af: "Openbare verifikasie" }),
    heroTitle: translatePublicValue(language, { en: "Verify public justice records without exposing protected data.", st: "Netefatsa lirekoto tsa toka tsa setjhaba ntle le ho pepesa data e sireleditsweng.", fr: "Verifiez les dossiers publics sans exposer les donnees protegees.", pt: "Verifique registos publicos sem expor dados protegidos.", es: "Verifique registros publicos sin exponer datos protegidos.", sw: "Thibitisha rekodi za umma bila kufichua data iliyolindwa.", ar: "تحقق من السجلات العامة من دون كشف البيانات المحمية.", de: "Prufen Sie offentliche Akten ohne geschutzte Daten offenzulegen.", zh: "在不暴露受保护数据的情况下验证公共司法记录。", hi: "सुरक्षित डेटा उजागर किए बिना सार्वजनिक न्याय रिकॉर्ड सत्यापित करें।", ur: "محفوظ ڈیٹا ظاہر کیے بغیر عوامی ریکارڈ کی تصدیق کریں۔", ru: "Проверяйте публичные записи без раскрытия защищенных данных.", af: "Verifieer openbare rekords sonder om beskermde data bloot te stel." }),
    heroBody: translatePublicValue(language, { en: "BEJAS stores full justice records in controlled systems and publishes only safe public summaries. Verification confirms that the public-facing record still matches its expected integrity state.", st: "BEJAS e boloka lirekoto tse felletseng ditshebetsong tse laolwang mme e phatlalatsa feela kakaretso e sireletsehileng ya setjhaba. Netefatso e bontsha hore rekoto ya setjhaba e ntse e tsamaisana le botshepehi bo lebelletsweng.", fr: "BEJAS conserve les dossiers complets dans des systemes controles et ne publie que des resumes publics securises. La verification confirme que le dossier public reste conforme.", pt: "O BEJAS guarda os registos completos em sistemas controlados e publica apenas resumos publicos seguros. A verificacao confirma que o registo publico continua consistente.", es: "BEJAS guarda los registros completos en sistemas controlados y solo publica resumenes publicos seguros. La verificacion confirma que el registro publico sigue siendo consistente.", sw: "BEJAS huhifadhi rekodi kamili katika mifumo inayodhibitiwa na huchapisha muhtasari salama wa umma pekee. Uthibitisho huonyesha kuwa rekodi ya umma bado inalingana.", ar: "يحفظ BEJAS السجلات الكاملة في أنظمة محكمة ولا ينشر إلا الملخصات العامة الآمنة. ويؤكد التحقق أن السجل العام ما زال متسقاً.", de: "BEJAS speichert vollstandige Akten in kontrollierten Systemen und veroffentlicht nur sichere offentliche Zusammenfassungen. Die Verifizierung bestatigt die Konsistenz des Datensatzes.", zh: "BEJAS 在受控系统中存储完整记录，只发布安全的公共摘要。验证会确认公共记录仍与预期完整性一致。", hi: "BEJAS पूर्ण रिकॉर्ड नियंत्रित प्रणालियों में रखता है और केवल सुरक्षित सार्वजनिक सार प्रकाशित करता है। सत्यापन पुष्टि करता है कि सार्वजनिक रिकॉर्ड अब भी सही है।", ur: "BEJAS مکمل ریکارڈ محفوظ نظاموں میں رکھتا ہے اور صرف محفوظ عوامی خلاصے شائع کرتا ہے۔ تصدیق یہ دکھاتی ہے کہ عوامی ریکارڈ اب بھی درست ہے۔", ru: "BEJAS хранит полные записи в контролируемых системах и публикует только безопасные сводки. Проверка подтверждает, что публичная запись остается целостной.", af: "BEJAS stoor volledige rekords in beheerde stelsels en publiseer net veilige openbare opsommings. Verifikasie bevestig dat die openbare rekord steeds ooreenstem." }),
    toolsTitle: translatePublicValue(language, { en: "Verification tools", st: "Disebediswa tsa netefatso", fr: "Outils de verification", pt: "Ferramentas de verificacao", es: "Herramientas de verificacion", sw: "Zana za uthibitisho", ar: "ادوات التحقق", de: "Verifizierungswerkzeuge", zh: "验证工具", hi: "सत्यापन उपकरण", ur: "تصدیقی اوزار", ru: "Инструменты проверки", af: "Verifikasienutsgoed" }),
    toolsDesc: translatePublicValue(language, { en: "Search the public case list or use a public-safe reference path.", st: "Batla lenane la dinyeoe tsa setjhaba kapa sebedisa tsela e sireletsehileng ya referense.", fr: "Recherchez la liste publique ou utilisez une reference sure.", pt: "Pesquise a lista publica ou use uma referencia segura.", es: "Busque la lista publica o use una referencia segura.", sw: "Tafuta kwenye orodha ya umma au tumia rejea salama ya umma.", ar: "ابحث في قائمة القضايا العامة أو استخدم مرجعاً آمناً.", de: "Durchsuchen Sie die offentliche Fallliste oder nutzen Sie eine sichere Referenz.", zh: "搜索公共案件列表或使用安全的公共参考。", hi: "सार्वजनिक केस सूची खोजें या सुरक्षित संदर्भ का उपयोग करें।", ur: "عوامی فہرست تلاش کریں یا محفوظ حوالہ استعمال کریں۔", ru: "Ищите в публичном списке дел или используйте безопасную ссылку.", af: "Deursoek die openbare saaklys of gebruik 'n veilige verwysing." }),
    casePlaceholder: translatePublicValue(language, { en: "Enter case number or public tracking reference", st: "Kenya nomoro ya nyeoe kapa referense ya setjhaba", fr: "Entrez le numero du dossier ou la reference publique", pt: "Introduza o numero do caso ou referencia publica", es: "Ingrese el numero del caso o referencia publica", sw: "Weka nambari ya kesi au rejea ya umma", ar: "ادخل رقم القضية او المرجع العام", de: "Fallnummer oder offentliche Referenz eingeben", zh: "输入案件编号或公共跟踪参考", hi: "केस नंबर या सार्वजनिक संदर्भ दर्ज करें", ur: "کیس نمبر یا عوامی حوالہ درج کریں", ru: "Введите номер дела или публичную ссылку", af: "Voer saaknommer of openbare verwysing in" }),
    docPlaceholder: translatePublicValue(language, { en: "Paste the public document text or summary you want to compare.", st: "Kgomaretsa mongolo kapa kakaretso ya tokomane ya setjhaba eo o batlang ho e bapisa.", fr: "Collez le texte public ou le resume a comparer.", pt: "Cole o texto publico ou resumo para comparar.", es: "Pegue el texto publico o resumen que desea comparar.", sw: "Bandika maandishi ya hati ya umma au muhtasari wa kulinganisha.", ar: "الصق نص الوثيقة العامة او الملخص للمقارنة.", de: "Fugen Sie den offentlichen Dokumenttext oder die Zusammenfassung zum Vergleich ein.", zh: "粘贴要比较的公共文档文本或摘要。", hi: "तुलना के लिए सार्वजनिक दस्तावेज़ पाठ या सार चिपकाएं।", ur: "موازنہ کے لیے عوامی متن یا خلاصہ چسپاں کریں۔", ru: "Вставьте текст публичного документа или сводку для сравнения.", af: "Plak die openbare dokumentteks of opsomming om te vergelyk." }),
    openSearch: translatePublicValue(language, { en: "Open Verification Search", st: "Bula patlo ya netefatso", fr: "Ouvrir la recherche de verification", pt: "Abrir pesquisa de verificacao", es: "Abrir busqueda de verificacion", sw: "Fungua utafutaji wa uthibitisho", ar: "افتح بحث التحقق", de: "Verifizierungssuche offnen", zh: "打开验证搜索", hi: "सत्यापन खोज खोलें", ur: "تصدیقی تلاش کھولیں", ru: "Открыть поиск проверки", af: "Maak verifikasiesoektog oop" }),
    compare: translatePublicValue(language, { en: "Compare Document", st: "Bapisa tokomane", fr: "Comparer le document", pt: "Comparar documento", es: "Comparar documento", sw: "Linganisha hati", ar: "قارن الوثيقة", de: "Dokument vergleichen", zh: "比较文档", hi: "दस्तावेज़ तुलना करें", ur: "دستاویز کا موازنہ کریں", ru: "Сравнить документ", af: "Vergelyk dokument" }),
    readIntegrity: translatePublicValue(language, { en: "Read how BEJAS integrity works", st: "Bala kamoo botshepehi ba BEJAS bo sebetsang kateng", fr: "Lire comment fonctionne l'integrite de BEJAS", pt: "Ler como funciona a integridade do BEJAS", es: "Leer como funciona la integridad de BEJAS", sw: "Soma jinsi uadilifu wa BEJAS unavyofanya kazi", ar: "اقرأ كيف تعمل سلامة BEJAS", de: "Lesen Sie, wie die Integritat von BEJAS funktioniert", zh: "了解 BEJAS 完整性如何工作", hi: "पढ़ें BEJAS अखंडता कैसे काम करती है", ur: "پڑھیں BEJAS کی سالمیت کیسے کام کرتی ہے", ru: "Узнайте, как работает целостность BEJAS", af: "Lees hoe BEJAS-integriteit werk" }),
  }

  async function verifyDocument() {
    const response = await fetch("/api/public/verify/document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseNumber: reference,
        documentText,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (data?.ok) setResult(data)
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
          <Select value={language} onValueChange={(value) => router.push(`/public/verify?lang=${value}`)}>
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

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-400/10">
                    {t.heroTag}
                  </Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  {t.heroTitle}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                  {t.heroBody}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {proofSteps.map((step, index) => (
                    <div key={step} className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-100">
                        {index + 1}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-white/70">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle>{t.toolsTitle}</CardTitle>
              <CardDescription className="text-white/60">
                {t.toolsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={t.casePlaceholder}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
              />
              <Textarea
                rows={6}
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder={t.docPlaceholder}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
              />
              <Button asChild className="w-full rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                <Link href={`/public/cases?lang=${language}${reference.trim() ? `&q=${encodeURIComponent(reference.trim())}` : ""}`}>
                  <Search className="mr-2 h-4 w-4" />
                  {t.openSearch}
                </Link>
              </Button>
              <Button onClick={verifyDocument} variant="secondary" className="w-full rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t.compare}
              </Button>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-cyan-100" />
                    Integrity status
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/66">
                    Public results can show verified, awaiting re-check, or restricted for review.
                  </div>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <QrCode className="h-4 w-4 text-cyan-100" />
                    QR verification
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/66">
                    QR-linked verification can be exposed later for public documents and summaries.
                  </div>
                </div>
              </div>
              {result ? (
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Comparison result</div>
                  <div className="mt-2 text-sm leading-6 text-white/68">
                    Matched case: {result.matchedCaseNumber}
                    <br />
                    Stored digest: {result.storedDigest}
                    <br />
                    Input digest: {result.inputDigest || "No input digest"}
                    <br />
                    Match: {result.matchesStoredDigest === null ? "Reference only" : result.matchesStoredDigest ? "Yes" : "No"}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                      <Link href={`/api/public/verify/certificate/${result.matchedCaseId}`}>Download PDF Certificate</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-[0.9rem] border-white/14 bg-white/5 !text-white hover:bg-white/10 hover:!text-white">
                      <Link href={`/api/public/verify/qr/${result.matchedCaseId}`} target="_blank">Open Verification QR</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
              <Link href={`/public/trust?lang=${language}`} className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-100 hover:text-white hover:no-underline">
                {t.readIntegrity}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default function PublicVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicVerifyPageContent />
    </Suspense>
  )
}
