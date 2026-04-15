"use client"

import Link from "next/link"
import { ArrowLeft, Download, Globe2, Newspaper, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const dataCards = [
  "Annual justice transparency datasets",
  "Aggregated public workflow counts",
  "District-level offense category summaries",
  "Monthly public service performance extracts",
] as const

export default function PublicOpenDataPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/public">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Badge variant="outline" className="border-cyan-300/24 bg-cyan-400/10 text-cyan-100">
            Open Data And Media
          </Badge>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-cyan-200" />
                Public research and open data
              </CardTitle>
              <CardDescription className="text-white/60">
                A public-facing space for anonymized datasets, media reading, and transparency materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataCards.map((item) => (
                <div key={item} className="rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-cyan-200" />
                Suggested outputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-cyan-100" />
                  Verified report packages
                </div>
                <div className="mt-2 text-sm leading-6 text-white/68">Downloadable public reports with integrity-oriented publication details.</div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Newspaper className="h-4 w-4 text-cyan-100" />
                  Media center
                </div>
                <div className="mt-2 text-sm leading-6 text-white/68">Press material, transparency summaries, and public modernization reading.</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
                  <Link href="/api/public/open-data?dataset=public-cases&format=json">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Link href="/api/public/open-data?dataset=public-cases&format=csv">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
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
