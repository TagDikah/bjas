"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Send, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

type PortalComment = {
  trackingNumber: string
  title: string
  message: string
  kind: string
}

function topicLabel(topic: string) {
  const normalized = String(topic || "").trim().toLowerCase()
  if (normalized === "service-complaint") return "Service complaint"
  if (normalized === "discrepancy-report") return "Discrepancy report"
  if (normalized === "service-suggestion") return "Service suggestion"
  if (normalized === "public-comment") return "Public comment"
  return "Public comment"
}

function PublicFeedbackPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const initialTopic = topicLabel(searchParams.get("topic") || "public-comment")
  const [topic, setTopic] = useState(initialTopic)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [comments, setComments] = useState<PortalComment[]>([])

  const canSubmit = useMemo(() => message.trim().length > 0, [message])
  const t = {
    back: translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" }),
    badge: translatePublicValue(language, { en: "Public Feedback And Comments", st: "Maikutlo le Ditshwaelo tsa Setjhaba", fr: "Commentaires publics", pt: "Comentarios publicos", es: "Comentarios publicos", sw: "Maoni ya umma", ar: "ملاحظات وتعليقات عامة", de: "Offentliches Feedback und Kommentare", zh: "公共反馈与评论", hi: "सार्वजनिक प्रतिक्रिया और टिप्पणियां", ur: "عوامی آراء اور تبصرے", ru: "Публичные отзывы и комментарии", af: "Openbare terugvoer en kommentaar" }),
    submitTitle: translatePublicValue(language, { en: "Submit public feedback", st: "Romela maikutlo a setjhaba", fr: "Soumettre un avis public", pt: "Enviar feedback publico", es: "Enviar comentarios publicos", sw: "Tuma maoni ya umma", ar: "إرسال ملاحظات عامة", de: "Offentliches Feedback senden", zh: "提交公众反馈", hi: "सार्वजनिक प्रतिक्रिया भेजें", ur: "عوامی رائے جمع کریں", ru: "Отправить публичный отзыв", af: "Dien openbare terugvoer in" }),
    submitButton: translatePublicValue(language, { en: "Submit For Review", st: "Romela bakeng sa Tlhahlobo", fr: "Soumettre pour examen", pt: "Enviar para revisao", es: "Enviar para revision", sw: "Wasilisha kwa ukaguzi", ar: "إرسال للمراجعة", de: "Zur Prufung senden", zh: "提交审核", hi: "समीक्षा हेतु भेजें", ur: "جائزے کے لیے جمع کریں", ru: "Отправить на проверку", af: "Dien vir hersiening in" }),
  }

  useEffect(() => {
    fetch("/api/public/portal/submissions?kind=public_comment&publishedOnly=1")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.submissions)) {
          setComments(
            data.submissions.map((item: any) => ({
              trackingNumber: item.trackingNumber,
              title: item.title || "Public comment",
              message: item.message,
              kind: item.kind,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const response = await fetch("/api/public/portal/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "public_comment",
        title: topic,
        message,
        personName: name,
        email,
        language: "en",
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (data?.ok) {
      setTrackingNumber(data.submission?.trackingNumber || "")
      setSubmitted(true)
      if (data.submission?.publishedPublicly) {
        setComments((current) => [
          {
            trackingNumber: data.submission.trackingNumber,
            title: data.submission.title || topic,
            message: data.submission.message,
            kind: data.submission.kind,
          },
          ...current,
        ])
      }
    }
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
          <Select value={language} onValueChange={(value) => router.push(`/public/feedback?topic=${encodeURIComponent(searchParams.get("topic") || "public-comment")}&lang=${value}`)}>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-200" />
                {t.submitTitle}
              </CardTitle>
              <CardDescription className="text-white/60">
                Comments are intended for reports, public dashboards, notices, and service quality. They are not for live case argument.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                  <div className="rounded-[1.2rem] border border-cyan-300/20 bg-cyan-400/10 p-5">
                  <div className="text-lg font-semibold text-white">Submission recorded</div>
                  <div className="mt-2 text-sm leading-6 text-white/72">
                    Your {topic.toLowerCase()} has been captured for moderation and review. Public comments should remain respectful and should not expose private case information.
                  </div>
                  {trackingNumber ? <div className="mt-3 text-sm font-semibold text-cyan-100">Tracking: {trackingNumber}</div> : null}
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-name" className="text-white/78">Name</Label>
                      <Input id="feedback-name" value={name} onChange={(e) => setName(e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-email" className="text-white/78">Email</Label>
                      <Input id="feedback-email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" placeholder="Optional contact email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-topic" className="text-white/78">Topic</Label>
                    <Input id="feedback-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-message" className="text-white/78">Comment or feedback</Label>
                    <Textarea
                      id="feedback-message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
                      placeholder="Write your public comment, service concern, or suggestion here."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t.submitButton}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-200" />
                  Comment rules
                </CardTitle>
                <CardDescription className="text-white/60">
                  BEJAS public comments are moderated for safety and lawful use.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-white/70">
                <div>Use comments for public reports, service feedback, dashboard reactions, and reform suggestions.</div>
                <div>Do not publish victim names, witness details, private addresses, threats, hate speech, or confidential case facts.</div>
                <div>Active criminal case arguments and defamatory allegations should not be posted here.</div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
              <CardHeader>
                <CardTitle>Recent public comments</CardTitle>
                <CardDescription className="text-white/60">
                  Example moderated comments for reports and service pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {comments.map((item) => (
                  <div key={item.trackingNumber} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
                        {item.kind}
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/66">{item.message}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function PublicFeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicFeedbackPageContent />
    </Suspense>
  )
}
