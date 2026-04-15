"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, BookOpen, CircleHelp, Landmark, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PUBLIC_LANGUAGE_OPTIONS, normalizePublicLanguage, translatePublicValue } from "@/lib/public-languages"

const faqs = [
  "What is a case number and where can I find it?",
  "Why can I not see witness or suspect details?",
  "What does 'under investigation' mean on the public portal?",
  "How do I verify if a public record is genuine?",
  "Where can I report a missing update or wrong summary?",
] as const

const serviceDirectory = [
  { label: "Police", detail: "Initial complaint capture, intake, and early public case opening." },
  { label: "Investigation", detail: "Evidence development and public-safe movement after intake." },
  { label: "Prosecution", detail: "Prosecutorial review, public filing signals, and pre-court preparation." },
  { label: "Courts", detail: "Public hearing and outcome publication where legally allowed." },
  { label: "Registry", detail: "Public routing, registry handling, and formal court entry points." },
] as const

function PublicHelpPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const language = normalizePublicLanguage(searchParams.get("lang"))
  const title = translatePublicValue(language, { en: "Citizen Help Center", st: "Setsi sa Thuso sa Baahi", fr: "Centre d'aide citoyen", pt: "Centro de ajuda ao cidadao", es: "Centro de ayuda ciudadana", sw: "Kituo cha msaada kwa raia", ar: "مركز مساعدة المواطنين", de: "Burgerhilfezentrum", zh: "公民帮助中心", hi: "नागरिक सहायता केंद्र", ur: "شہری مدد مرکز", ru: "Центр помощи гражданам", af: "Burgersentrum vir hulp" })
  const backText = translatePublicValue(language, { en: "Back", st: "Kgutlela Morao", fr: "Retour", pt: "Voltar", es: "Volver", sw: "Rudi", ar: "عودة", de: "Zuruck", zh: "返回", hi: "वापस", ur: "واپس", ru: "Назад", af: "Terug" })
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href={`/public?lang=${language}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backText}
            </Link>
          </Button>
          <Select value={language} onValueChange={(value) => router.push(`/public/help?lang=${value}`)}>
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
            {title}
          </Badge>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleHelp className="h-5 w-5 text-cyan-200" />
                Frequently asked questions
              </CardTitle>
              <CardDescription className="text-white/60">
                Core questions citizens usually ask when using the public justice portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((item, index) => (
                <div key={item} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/72">FAQ {index + 1}</div>
                  <div className="mt-2 text-sm leading-6 text-white/74">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-cyan-200" />
                Justice service directory
              </CardTitle>
              <CardDescription className="text-white/60">
                Quick public guidance about what each institution does in the visible justice workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {serviceDirectory.map((item) => (
                <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-base font-semibold text-white">{item.label}</div>
                  <div className="mt-2 text-sm leading-6 text-white/68">{item.detail}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-200" />
                Legal process explainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-white/70">
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Complaint process: reporting, registration, public-safe status, and routing.</div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Investigation process: broad public stage movement without exposing evidence.</div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">Court process: filing, public hearings where lawful, outcomes, and appeal visibility.</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
                Need more help?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                <Link href={`/public/complaints?lang=${language}`}>Open complaints</Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                <Link href={`/public/feedback?lang=${language}`}>Open feedback</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default function PublicHelpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicHelpPageContent />
    </Suspense>
  )
}
