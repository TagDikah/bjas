import type { CaseData } from "@/lib/blockchain"
import { LESOTHO_CONSTITUTION_ARTICLES, getRelevantConstitutionArticles } from "@/lib/legal/lesotho-constitution"
import { readEnv } from "@/lib/server/env"

export type JudicialFairnessCheck = {
  label: string
  section: string
  status: "pass" | "caution" | "review"
  reason: string
}

export type JudicialDecisionSupport = {
  caseId: string
  caseNumber: string
  generatedAt: string
  aiMode: "huggingface" | "local-fallback"
  modelId: string | null
  nonBindingNotice: string
  constitutionalAnchors: ReturnType<typeof getRelevantConstitutionArticles>
  factsConsidered: string[]
  fairnessChecks: JudicialFairnessCheck[]
  issuesForJudge: string[]
  suggestedNextSteps: string[]
  draftRulingTemplate: {
    heading: string
    summary: string
    orders: string[]
  }
  aiNarrative: string
}

type DecisionSupportInput = {
  caseData: CaseData
  defenseSummary?: string
  prosecutionSummary?: string
  requestedRelief?: string
  judgeQuestion?: string
}

type AiServiceResponse = {
  mode?: string
  model_id?: string | null
  analysis_text?: string
}

type JudgeAiResult = {
  ok: boolean
  mode: "huggingface" | "local-fallback"
  modelId: string | null
  analysisText: string
}

function text(value: unknown) {
  return String(value || "").trim()
}

function firstNonEmpty(...values: unknown[]) {
  return values.map(text).find(Boolean) || ""
}

function buildFacts(caseData: CaseData, input: DecisionSupportInput) {
  const facts = [
    `Case number: ${firstNonEmpty(caseData.caseNumber, caseData.caseId)}`,
    `Charge: ${firstNonEmpty(caseData.charge, "Unspecified charge")}`,
    `Parties: ${firstNonEmpty(caseData.parties, "Not recorded")}`,
    `District: ${firstNonEmpty(caseData.district, "Not recorded")}`,
    `Current status: ${firstNonEmpty(caseData.status, "Unknown status")}`,
    `Case summary: ${firstNonEmpty(caseData.description, caseData.policeSections?.sectionA?.summary, "No narrative summary recorded")}`,
    `Defence summary: ${firstNonEmpty(input.defenseSummary, "No defence summary supplied")}`,
    `Prosecution summary: ${firstNonEmpty(input.prosecutionSummary, "No prosecution summary supplied")}`,
    `Requested relief: ${firstNonEmpty(input.requestedRelief, "No requested relief supplied")}`,
  ]

  const representation = text(caseData?.hearingRecord?.latestEntry?.representationStatus)
  if (representation) facts.push(`Representation status: ${representation}`)

  const bailDecision = text(caseData?.hearingRecord?.latestEntry?.bailDecision)
  if (bailDecision) facts.push(`Bail position: ${bailDecision}`)

  if (Array.isArray(caseData?.evidence)) {
    facts.push(`Evidence items recorded: ${caseData.evidence.length}`)
  }

  return facts
}

function buildFairnessChecks(caseData: CaseData, input: DecisionSupportInput): JudicialFairnessCheck[] {
  const checks: JudicialFairnessCheck[] = [
    {
      label: "Independent and impartial hearing",
      section: "Section 12 and Section 118",
      status: "pass",
      reason: "The recommendation is advisory only and preserves judicial independence.",
    },
  ]

  if (!text(input.defenseSummary)) {
    checks.push({
      label: "Defence participation",
      section: "Section 12",
      status: "review",
      reason: "No defence summary was provided. A ruling should be cautious until the defence position is clearly on record.",
    })
  } else {
    checks.push({
      label: "Defence participation",
      section: "Section 12",
      status: "pass",
      reason: "A defence position was provided for the court to weigh.",
    })
  }

  const representation = text(caseData?.hearingRecord?.latestEntry?.representationStatus)
  checks.push({
    label: "Representation and facilities for defence",
    section: "Section 12",
    status: representation ? "pass" : "caution",
    reason: representation
      ? `Representation status recorded as "${representation}".`
      : "No representation status is recorded in the case file summary.",
  })

  const accusedPresence = text(caseData?.hearingRecord?.latestEntry?.accusedPresence)
  checks.push({
    label: "Presence of the accused",
    section: "Section 12",
    status: accusedPresence === "absent" ? "review" : "pass",
    reason:
      accusedPresence === "absent"
        ? "The latest hearing entry marks the accused as absent. The court should verify whether proceeding is constitutionally and procedurally justified."
        : "No absence flag prevents the court from proceeding on the current record.",
  })

  const bailDecision = text(caseData?.hearingRecord?.latestEntry?.bailDecision)
  if (bailDecision) {
    checks.push({
      label: "Personal liberty and delay",
      section: "Section 6",
      status: bailDecision === "denied" ? "caution" : "pass",
      reason:
        bailDecision === "denied"
          ? "If the matter is adjourned again, continued detention should be reviewed against the Constitution's liberty protections."
          : `Bail decision is recorded as "${bailDecision}".`,
    })
  }

  return checks
}

function buildIssues(caseData: CaseData, input: DecisionSupportInput, fairnessChecks: JudicialFairnessCheck[]) {
  const issues = fairnessChecks
    .filter((item) => item.status !== "pass")
    .map((item) => `${item.label}: ${item.reason}`)

  if (!text(input.prosecutionSummary)) {
    issues.push("Prosecution summary is missing, so the evidential and legal basis of the charge should be confirmed before final orders.")
  }

  const charge = text(caseData.charge).toLowerCase()
  if (/murder|rape|treason|armed|robbery|homicide/.test(charge)) {
    issues.push("The charge appears serious and may justify a tighter review of jurisdiction, constitutional safeguards, and High Court handling.")
  }

  return issues
}

function buildSuggestedNextSteps(caseData: CaseData, fairnessChecks: JudicialFairnessCheck[], input: DecisionSupportInput) {
  const steps: string[] = []
  const hasReview = fairnessChecks.some((item) => item.status === "review")

  if (hasReview) {
    steps.push("Consider reserving the ruling or directing supplementary submissions before making a final order.")
  } else {
    steps.push("If the record is complete, the court may proceed to a reasoned ruling grounded in the Constitution and the evidence on file.")
  }

  if (!text(input.defenseSummary)) {
    steps.push("Require a clear defence position or confirm that the defence declines to add further submissions.")
  }

  if (!text(caseData?.hearingRecord?.latestEntry?.representationStatus)) {
    steps.push("Confirm whether the accused is represented, self-represented, or requires interpretation or other practical hearing safeguards.")
  }

  steps.push("State expressly that the accused remains presumed innocent unless guilt has been established according to law.")
  steps.push("Tie each material finding to the evidence actually on record and avoid relying on administrative summaries alone.")

  return steps
}

function buildDraftRulingTemplate(caseData: CaseData, input: DecisionSupportInput, issues: string[]) {
  return {
    heading: `Draft Constitutional Ruling Outline for ${firstNonEmpty(caseData.caseNumber, caseData.caseId)}`,
    summary: [
      `The court has considered the charge of ${firstNonEmpty(caseData.charge, "the offence charged")}, the prosecution submissions, the defence submissions, and the applicable Constitution of Lesotho safeguards.`,
      "The court remains bound by the supremacy of the Constitution, the accused's fair trial rights, equality before the law, and the independence of the judiciary.",
      issues.length
        ? `Before final determination, the court notes the following matters requiring attention: ${issues.join(" ")}`
        : "No constitutional fairness defect is obvious on the current record, but the ruling should still rest only on tested evidence and lawful procedure.",
    ].join(" "),
    orders: [
      "Record the issues, evidence, and submissions considered by the court.",
      "Address fair trial safeguards, including defence participation, presumption of innocence, and hearing fairness.",
      `Grant, refuse, adjourn, or reserve the requested relief: ${firstNonEmpty(input.requestedRelief, "to be specified by the court")}.`,
      "Explain the legal and constitutional basis for the order in plain language.",
    ],
  }
}

async function callJudgeAiService(payload: Record<string, unknown>): Promise<JudgeAiResult> {
  const serviceUrl = text(readEnv("JUDGE_AI_SERVICE_URL", { fallback: "http://ai-judge:5000" }))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${serviceUrl}/judge-support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`AI service responded with ${response.status}`)
    }

    const json = (await response.json()) as AiServiceResponse
    return {
      ok: true as const,
      mode: json.mode === "huggingface" ? "huggingface" : "local-fallback",
      modelId: json.model_id ?? null,
      analysisText: text(json.analysis_text),
    }
  } catch {
    return {
      ok: false as const,
      mode: "local-fallback" as const,
      modelId: null,
      analysisText: "",
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function buildJudicialDecisionSupport(input: DecisionSupportInput): Promise<JudicialDecisionSupport> {
  const caseData = input.caseData
  const constitutionalAnchors = getRelevantConstitutionArticles(caseData as Record<string, any>)
  const factsConsidered = buildFacts(caseData, input)
  const fairnessChecks = buildFairnessChecks(caseData, input)
  const issuesForJudge = buildIssues(caseData, input, fairnessChecks)
  const suggestedNextSteps = buildSuggestedNextSteps(caseData, fairnessChecks, input)
  const draftRulingTemplate = buildDraftRulingTemplate(caseData, input, issuesForJudge)

  const aiPayload = {
    case_id: caseData.caseId,
    case_number: caseData.caseNumber,
    charge: caseData.charge,
    status: caseData.status,
    facts: factsConsidered,
    defense_summary: text(input.defenseSummary),
    prosecution_summary: text(input.prosecutionSummary),
    requested_relief: text(input.requestedRelief),
    judge_question: text(input.judgeQuestion),
    constitutional_articles: constitutionalAnchors.map((item) => ({
      section: item.section,
      title: item.title,
      principle: item.principle,
      relevance: item.relevance,
    })),
  }

  const aiResult = await callJudgeAiService(aiPayload)
  const constitutionalDigest = constitutionalAnchors.map((item) => `${item.section}: ${item.title}`).join("; ")

  const aiNarrative =
    aiResult.analysisText ||
    [
      "Local constitutional fallback analysis was used because the external Hugging Face service was unavailable.",
      `Core constitutional anchors reviewed: ${constitutionalDigest}.`,
      issuesForJudge.length
        ? `Matters requiring judicial attention: ${issuesForJudge.join(" ")}`
        : "No immediate constitutional defect is obvious from the current record summary.",
    ].join(" ")

  return {
    caseId: caseData.caseId,
    caseNumber: firstNonEmpty(caseData.caseNumber, caseData.caseId),
    generatedAt: new Date().toISOString(),
    aiMode: aiResult.mode,
    modelId: aiResult.modelId,
    nonBindingNotice:
      "This output is decision support only. Under the Constitution of Lesotho, judicial power remains with the courts, and the judge must independently assess law, facts, evidence, and procedure.",
    constitutionalAnchors: constitutionalAnchors.length ? constitutionalAnchors : LESOTHO_CONSTITUTION_ARTICLES,
    factsConsidered,
    fairnessChecks,
    issuesForJudge,
    suggestedNextSteps,
    draftRulingTemplate,
    aiNarrative,
  }
}
