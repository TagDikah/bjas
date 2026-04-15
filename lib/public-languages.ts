export const PUBLIC_LANGUAGE_OPTIONS = [
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

export type PublicLanguageCode = (typeof PUBLIC_LANGUAGE_OPTIONS)[number]["code"]

export function normalizePublicLanguage(value: string | null | undefined): PublicLanguageCode {
  const code = String(value || "").trim().toLowerCase()
  return (PUBLIC_LANGUAGE_OPTIONS.find((item) => item.code === code)?.code || "en") as PublicLanguageCode
}

export function translatePublicValue<T>(language: PublicLanguageCode, values: Record<string, T>): T {
  return values[language] ?? values.en
}
