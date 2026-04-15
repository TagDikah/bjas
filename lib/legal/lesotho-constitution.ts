export type LesothoConstitutionArticle = {
  section: string
  title: string
  principle: string
  relevance: string
  sourceUrl: string
}

const SOURCE_URL = "https://www.constituteproject.org/constitution/Lesotho_2011"

export const LESOTHO_CONSTITUTION_ARTICLES: LesothoConstitutionArticle[] = [
  {
    section: "Section 2",
    title: "Supremacy of the Constitution",
    principle: "The Constitution is the supreme law, and any inconsistent law is void to the extent of the inconsistency.",
    relevance: "Every ruling recommendation must be screened for constitutional compliance before statutory or procedural convenience.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 4",
    title: "Fundamental Rights and Freedoms",
    principle: "Every person in Lesotho is entitled to core rights including liberty, fair trial, privacy, expression, and equality before the law.",
    relevance: "Judge support should treat rights review as mandatory, not optional, whenever liberty, evidence handling, or hearing fairness is involved.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 6",
    title: "Right to Personal Liberty",
    principle: "Arrested persons must be brought before a court promptly, and where trial is not held within a reasonable time they should be released unconditionally or on reasonable conditions.",
    relevance: "Bail, remand, and postponement guidance must account for liberty interests and delay.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 10",
    title: "Freedom from Arbitrary Search or Entry",
    principle: "Searches and entries should not be arbitrary and must rest on lawful authority.",
    relevance: "Evidence-origin concerns should be flagged where search, seizure, or entry appears irregular.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 12",
    title: "Right to Fair Trial",
    principle: "Criminal charges require a fair hearing within a reasonable time before an independent and impartial court, with presumption of innocence, adequate defence preparation, counsel choice, witness examination, and interpretation where needed.",
    relevance: "This is the main constitutional frame for hearing management, defence participation, and ruling readiness.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 19",
    title: "Equality Before the Law",
    principle: "Every person is entitled to equality before the law and equal protection of the law.",
    relevance: "Comparable cases should be treated consistently and discriminatory reasoning should be screened out.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 22",
    title: "Enforcement of Protective Provisions",
    principle: "The High Court has original jurisdiction to grant redress where constitutional rights are allegedly contravened.",
    relevance: "Where a lower-court issue raises a serious constitutional question, escalation or referral should be considered.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 118",
    title: "Independence of the Judiciary",
    principle: "Courts are independent, free from interference, and subject only to the Constitution and other law.",
    relevance: "AI output must remain advisory and cannot override judicial discretion or direct the court.",
    sourceUrl: SOURCE_URL,
  },
  {
    section: "Section 119",
    title: "High Court Jurisdiction",
    principle: "The High Court has unlimited original jurisdiction in civil and criminal matters and may review inferior courts and tribunals.",
    relevance: "Serious or constitutionally complex matters can be flagged for High Court treatment.",
    sourceUrl: SOURCE_URL,
  },
]

export function getRelevantConstitutionArticles(caseData: Record<string, any>) {
  const charge = String(caseData?.charge || "").toLowerCase()
  const status = String(caseData?.status || "").toLowerCase()
  const hasBailContext =
    status.includes("bail") ||
    String(caseData?.hearingRecord?.latestEntry?.bailDecision || "").trim().length > 0

  return LESOTHO_CONSTITUTION_ARTICLES.filter((article) => {
    if (article.section === "Section 6") return hasBailContext
    if (article.section === "Section 10") {
      const evidenceText = JSON.stringify(caseData?.evidence || caseData?.policeSections || {})
      return /search|seiz|warrant|entry|premises/i.test(evidenceText)
    }
    if (article.section === "Section 22" || article.section === "Section 119") {
      return /murder|treason|rape|serious|homicide|armed/.test(charge)
    }
    return true
  })
}
