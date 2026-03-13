"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Mic, Square, RefreshCw, Info } from "lucide-react"

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  /** default language tag, e.g. st-ZA */
  defaultLang?: string
}

// A practical list (browser SpeechRecognition supports only some locales).
// Users can also type a custom BCP-47 tag.
const LANGS: Array<{ tag: string; label: string }> = [
  { tag: "st-ZA", label: "Sesotho (Lesotho/South Africa)" },
  { tag: "en-ZA", label: "English (South Africa)" },
  { tag: "en-US", label: "English (US)" },
  { tag: "af-ZA", label: "Afrikaans" },
  { tag: "zu-ZA", label: "isiZulu" },
  { tag: "xh-ZA", label: "isiXhosa" },
  { tag: "tn-ZA", label: "Setswana" },
  { tag: "fr-FR", label: "French" },
  { tag: "pt-PT", label: "Portuguese" },
  { tag: "es-ES", label: "Spanish" },
  { tag: "ar", label: "Arabic" },
]

export function VoiceDictation({ value, onChange, placeholder, defaultLang = "st-ZA" }: Props) {
  const [isSupported, setIsSupported] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [lang, setLang] = React.useState(defaultLang)
  const [customLang, setCustomLang] = React.useState("")
  const recognitionRef = React.useRef<any>(null)
  const interimRef = React.useRef("")

  React.useEffect(() => {
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null
    setIsSupported(Boolean(SR))
    if (!SR) return

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.lang = lang

    rec.onresult = (event: any) => {
      let finalText = ""
      let interimText = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        const text = res[0]?.transcript ?? ""
        if (res.isFinal) finalText += text
        else interimText += text
      }

      // Keep interim separate so we don't spam the main textarea with partials
      interimRef.current = interimText
      if (finalText.trim()) {
        const spacer = value && !value.endsWith(" ") ? " " : ""
        onChange((value + spacer + smartFormat(finalText)).trimStart())
      }
    }

    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)

    recognitionRef.current = rec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const rec = recognitionRef.current
    if (rec) rec.lang = customLang.trim() ? customLang.trim() : lang
  }, [lang, customLang])

  const start = () => {
    const rec = recognitionRef.current
    if (!rec) return
    interimRef.current = ""
    setIsListening(true)
    try {
      rec.start()
    } catch {
      // Some browsers throw if already started
    }
  }

  const stop = () => {
    const rec = recognitionRef.current
    if (!rec) return
    setIsListening(false)
    try {
      rec.stop()
    } catch {
      // ignore
    }
  }

  return (
    <Card className="border-border bg-card p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="h-4 w-4" />
            Voice statement (Speech-to-text)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.tag} value={l.tag}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              className="w-[190px]"
              placeholder="Custom tag e.g. st-LS"
              value={customLang}
              onChange={(e) => setCustomLang(e.target.value)}
            />

            {!isSupported ? (
              <Button variant="secondary" disabled>
                <Info className="h-4 w-4" />
                Not supported
              </Button>
            ) : isListening ? (
              <Button variant="destructive" onClick={stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={start}>
                <Mic className="h-4 w-4" />
                Start
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => onChange("")}
              title="Clear"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <textarea
          className="min-h-[160px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          placeholder={
            placeholder ||
            "Click Start and speak. Your statement will appear here. You can edit it manually too."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="text-xs text-muted-foreground">
          Tip: Speech recognition depends on your browser. If Sesotho isn’t recognized on your device,
          keep typing normally or try a different language tag.
        </div>
      </div>
    </Card>
  )
}

function smartFormat(text: string) {
  // Lightweight formatting: trim + normalize spaces
  const t = text.replace(/\s+/g, " ").trim()
  // Add a period if user ended without punctuation (keeps it readable, ChatGPT-like)
  if (!t) return t
  if (/[.!?]$/.test(t)) return t
  return t + "."
}
