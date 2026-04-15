"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import {
  Activity,
  ClipboardCheck,
  Fingerprint,
  HeartPulse,
  Package,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react"

import type { CaseData, User } from "@/lib/blockchain"
import type { PublicActivityType } from "@/lib/public-case-tracking"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

type TabKey = "admission" | "sentence" | "parole" | "release"

type FieldConfig = {
  key: string
  label: string
  type?: "text" | "date" | "select" | "textarea"
  placeholder?: string
  rows?: number
  options?: { label: string; value: string }[]
}

type SectionConfig = {
  key: string
  group: TabKey
  title: string
  description: string
  accent: string
  requiredKeys?: string[]
  fields: FieldConfig[]
}

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function text(value: unknown, fallback = "N/A") {
  const normalized = String(value || "").trim()
  return normalized || fallback
}

function formatStatus(status: unknown) {
  return text(String(status || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const SECTIONS: SectionConfig[] = [
  {
    key: "inmateIntake",
    group: "admission",
    title: "Inmate Intake Form",
    description: "Register convicted offender admission and court transfer details.",
    accent: "#5a8cff",
    requiredKeys: ["fullName", "caseReference", "courtName", "offenceCharge", "admissionDate"],
    fields: [
      { key: "fullName", label: "Full Name", placeholder: "Enter inmate full name" },
      { key: "nationalId", label: "National ID / Passport", placeholder: "Enter national ID or passport" },
      { key: "gender", label: "Gender", type: "select", options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }] },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      { key: "nationality", label: "Nationality", placeholder: "Enter nationality" },
      { key: "maritalStatus", label: "Marital Status", placeholder: "Enter marital status" },
      { key: "nextOfKinName", label: "Next of Kin Name", placeholder: "Enter next of kin full name" },
      { key: "nextOfKinContact", label: "Next of Kin Contact", placeholder: "Enter next of kin contact" },
      { key: "caseReference", label: "Case ID / Case Number", placeholder: "LMPS-2026-31894" },
      { key: "courtName", label: "Court Name", placeholder: "High Court / Magistrate Court" },
      { key: "judgeName", label: "Judge Name", placeholder: "Enter judge or magistrate name" },
      { key: "offenceCharge", label: "Offence / Charge", placeholder: "Enter charge" },
      { key: "convictionDate", label: "Conviction Date", type: "date" },
      { key: "admissionDate", label: "Admission Date", type: "date" },
      { key: "sentenceType", label: "Sentence Type", type: "select", options: [{ label: "Custodial", value: "custodial" }, { label: "Fine", value: "fine" }, { label: "Both", value: "both" }] },
      { key: "sentenceLength", label: "Sentence Length", placeholder: "Example: 5 years" },
      { key: "sentenceStartDate", label: "Sentence Start Date", type: "date" },
      { key: "expectedReleaseDate", label: "Expected Release Date", type: "date" },
      { key: "transferredFrom", label: "Transferred From", placeholder: "Court / Police" },
      { key: "escortOfficers", label: "Escort Officers", placeholder: "Enter escort officer names" },
      { key: "transferDateTime", label: "Transfer Date & Time", placeholder: "28/03/2026 14:10" },
    ],
  },
  {
    key: "prisonerClassification",
    group: "admission",
    title: "Prisoner Classification Form",
    description: "Determine custody risk, special handling, and placement.",
    accent: "#2fd4ff",
    requiredKeys: ["riskLevel", "crimeType", "assignedFacility"],
    fields: [
      { key: "riskLevel", label: "Risk Level", type: "select", options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }] },
      { key: "crimeType", label: "Crime Type", type: "select", options: [{ label: "Violent", value: "violent" }, { label: "Non-violent", value: "non_violent" }] },
      { key: "offenderType", label: "First-time / Repeat", type: "select", options: [{ label: "First-time", value: "first_time" }, { label: "Repeat Offender", value: "repeat" }] },
      { key: "gangAffiliation", label: "Gang Affiliation", placeholder: "Yes / No / Details" },
      { key: "escapeRisk", label: "Escape Risk", placeholder: "Low / Medium / High" },
      { key: "specialCategory", label: "Special Category", type: "select", options: [{ label: "None", value: "none" }, { label: "Juvenile", value: "juvenile" }, { label: "Female", value: "female" }, { label: "High-profile", value: "high_profile" }] },
      { key: "assignedFacility", label: "Assigned Facility / Block / Cell", placeholder: "Facility, block, and cell" },
    ],
  },
  {
    key: "medicalExamination",
    group: "admission",
    title: "Medical Examination Form",
    description: "Record admission medical findings and detention fitness.",
    accent: "#ff7a9f",
    requiredKeys: ["physicalCondition", "fitForDetention"],
    fields: [
      { key: "physicalCondition", label: "Physical Condition", placeholder: "Describe physical condition" },
      { key: "injuries", label: "Injuries", placeholder: "Record visible injuries" },
      { key: "chronicIllnesses", label: "Chronic Illnesses", placeholder: "List chronic illnesses" },
      { key: "mentalHealthStatus", label: "Mental Health Status", placeholder: "Describe mental status" },
      { key: "substanceAbuseHistory", label: "Substance Abuse History", placeholder: "Alcohol / drug history" },
      { key: "hivTbStatus", label: "HIV / TB Status", placeholder: "Where applicable" },
      { key: "doctorNotes", label: "Doctor Notes", type: "textarea", rows: 4, placeholder: "Clinical notes and recommendations" },
      { key: "fitForDetention", label: "Fit for Detention", type: "select", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
    ],
  },
  {
    key: "propertyIntake",
    group: "admission",
    title: "Property Intake Form",
    description: "Record inmate personal belongings received at admission.",
    accent: "#f7c948",
    requiredKeys: ["itemName", "quantity", "storedLocation"],
    fields: [
      { key: "itemName", label: "Item Name", placeholder: "Phone, cash, clothes..." },
      { key: "quantity", label: "Quantity", placeholder: "Enter quantity" },
      { key: "estimatedValue", label: "Estimated Value", placeholder: "Enter value" },
      { key: "serialNumbers", label: "Serial Numbers", placeholder: "List serial numbers" },
      { key: "condition", label: "Condition", placeholder: "New / Used / Damaged" },
      { key: "storedLocation", label: "Stored Location", placeholder: "Property room / locker" },
      { key: "officerSignature", label: "Officer Signature", placeholder: "Receiving officer name" },
    ],
  },
  {
    key: "biometricIdentification",
    group: "admission",
    title: "Biometric & Identification Form",
    description: "Capture unique identity, fingerprints, and mugshot status.",
    accent: "#9b7bff",
    requiredKeys: ["uniqueInmateId", "fingerprintsCaptured", "mugshotFrontCaptured"],
    fields: [
      { key: "uniqueInmateId", label: "Unique Inmate ID", placeholder: "Enter inmate ID" },
      { key: "fingerprintsCaptured", label: "Fingerprints", type: "select", options: [{ label: "Captured", value: "captured" }, { label: "Pending", value: "pending" }] },
      { key: "mugshotFrontCaptured", label: "Mugshot Front", type: "select", options: [{ label: "Captured", value: "captured" }, { label: "Pending", value: "pending" }] },
      { key: "mugshotSideCaptured", label: "Mugshot Side", type: "select", options: [{ label: "Captured", value: "captured" }, { label: "Pending", value: "pending" }] },
      { key: "dnaCollected", label: "DNA", type: "select", options: [{ label: "Collected", value: "collected" }, { label: "Not Collected", value: "not_collected" }, { label: "Optional / N/A", value: "optional" }] },
    ],
  },
  {
    key: "sentenceExecution",
    group: "sentence",
    title: "Sentence Execution Record",
    description: "Track time served, reductions, appeals, and court order changes.",
    accent: "#5a8cff",
    fields: [
      { key: "sentenceStartDate", label: "Sentence Start Date", type: "date" },
      { key: "daysServed", label: "Days Served", placeholder: "Enter served days" },
      { key: "remainingDays", label: "Remaining Days", placeholder: "Enter remaining days" },
      { key: "remissionReduction", label: "Remission / Reduction", placeholder: "Any sentence reduction" },
      { key: "courtOrderUpdates", label: "Court Orders Updates", type: "textarea", rows: 4, placeholder: "Record court order updates" },
      { key: "appealsStatus", label: "Appeals Status", placeholder: "Pending / Dismissed / Allowed" },
    ],
  },
  {
    key: "behaviorDiscipline",
    group: "sentence",
    title: "Daily Behavior & Discipline Report",
    description: "Capture behavior score, violations, punishment, and officer notes.",
    accent: "#2fd4ff",
    fields: [
      { key: "reportDate", label: "Date", type: "date" },
      { key: "behaviorRating", label: "Behavior Rating", type: "select", options: [{ label: "Good", value: "good" }, { label: "Fair", value: "fair" }, { label: "Bad", value: "bad" }] },
      { key: "violations", label: "Violations", placeholder: "List violations if any" },
      { key: "punishmentGiven", label: "Punishment Given", placeholder: "Record punishment" },
      { key: "officerNotes", label: "Officer Notes", type: "textarea", rows: 4, placeholder: "Behavior observations" },
    ],
  },
  {
    key: "rehabilitationPrograms",
    group: "sentence",
    title: "Rehabilitation & Programs Form",
    description: "Track programs, completion, performance, and certificates.",
    accent: "#ff7a9f",
    fields: [
      { key: "programName", label: "Program Name", placeholder: "Education / Skills / Counseling" },
      { key: "enrollmentDate", label: "Enrollment Date", type: "date" },
      { key: "completionStatus", label: "Completion Status", type: "select", options: [{ label: "Enrolled", value: "enrolled" }, { label: "In Progress", value: "in_progress" }, { label: "Completed", value: "completed" }] },
      { key: "performanceNotes", label: "Performance Notes", type: "textarea", rows: 4, placeholder: "Performance and participation notes" },
      { key: "certificatesIssued", label: "Certificates Issued", placeholder: "List issued certificates" },
    ],
  },
  {
    key: "visitorManagement",
    group: "sentence",
    title: "Visitor Management Form",
    description: "Capture approved visits, relationships, and visitor items.",
    accent: "#f7c948",
    fields: [
      { key: "visitorName", label: "Visitor Name", placeholder: "Enter visitor name" },
      { key: "relationship", label: "Relationship", placeholder: "Family / Lawyer / Other" },
      { key: "visitorIdNumber", label: "ID Number", placeholder: "Enter ID number" },
      { key: "visitDateTime", label: "Visit Date & Time", placeholder: "28/03/2026 16:30" },
      { key: "itemsBrought", label: "Items Brought", placeholder: "Items brought to prison" },
      { key: "approvalStatus", label: "Approval Status", type: "select", options: [{ label: "Approved", value: "approved" }, { label: "Pending", value: "pending" }, { label: "Denied", value: "denied" }] },
    ],
  },
  {
    key: "incidentReport",
    group: "sentence",
    title: "Incident Report Form",
    description: "Record prison incidents such as fights or escape attempts.",
    accent: "#9b7bff",
    fields: [
      { key: "incidentType", label: "Incident Type", placeholder: "Fight / Escape Attempt / Assault" },
      { key: "incidentDateTime", label: "Date & Time", placeholder: "28/03/2026 18:00" },
      { key: "incidentLocation", label: "Location", placeholder: "Cell block / yard / clinic" },
      { key: "peopleInvolved", label: "People Involved", placeholder: "List inmates / officers involved" },
      { key: "incidentInjuries", label: "Injuries", placeholder: "Record injuries if any" },
      { key: "actionTaken", label: "Action Taken", type: "textarea", rows: 4, placeholder: "Describe action taken" },
    ],
  },
  {
    key: "paroleEligibility",
    group: "parole",
    title: "Parole Eligibility & Review Form",
    description: "Assess parole readiness using behavior, rehabilitation, and risk.",
    accent: "#5a8cff",
    requiredKeys: ["timeServedPercent", "behaviorRecord", "recommendation"],
    fields: [
      { key: "timeServedPercent", label: "Time Served (%)", placeholder: "Enter served percentage" },
      { key: "behaviorRecord", label: "Behavior Record", placeholder: "Good / Mixed / Poor" },
      { key: "rehabilitationCompletion", label: "Rehabilitation Completion", placeholder: "Programs completed" },
      { key: "riskAssessment", label: "Risk Assessment", placeholder: "Low / Medium / High" },
      { key: "victimImpactStatement", label: "Victim Impact Statement", type: "textarea", rows: 4, placeholder: "Victim impact summary" },
      { key: "recommendation", label: "Recommendation", type: "select", options: [{ label: "Approve", value: "approve" }, { label: "Reject", value: "reject" }] },
    ],
  },
  {
    key: "paroleDecision",
    group: "parole",
    title: "Parole Decision Form",
    description: "Capture board outcome, conditions, and assigned parole officer.",
    accent: "#2fd4ff",
    fields: [
      { key: "decision", label: "Decision", type: "select", options: [{ label: "Approved", value: "approved" }, { label: "Denied", value: "denied" }] },
      { key: "conditions", label: "Conditions", type: "textarea", rows: 4, placeholder: "Reporting requirements and restrictions" },
      { key: "paroleOfficerAssigned", label: "Parole Officer Assigned", placeholder: "Enter parole officer" },
      { key: "nextReviewDate", label: "Next Review Date", type: "date" },
    ],
  },
  {
    key: "releaseForm",
    group: "release",
    title: "Release Form",
    description: "Record final release details, property return, and transport plan.",
    accent: "#ff7a9f",
    requiredKeys: ["releaseType", "releaseDateTime"],
    fields: [
      { key: "releaseType", label: "Release Type", type: "select", options: [{ label: "Completed Sentence", value: "completed_sentence" }, { label: "Parole", value: "parole" }, { label: "Bail", value: "bail" }, { label: "Court Ordered Release", value: "court_release" }] },
      { key: "releaseDateTime", label: "Release Date & Time", placeholder: "28/03/2026 10:00" },
      { key: "conditionOfRelease", label: "Condition of Release", placeholder: "Stable / Medical / High supervision" },
      { key: "propertyReturned", label: "Property Returned", placeholder: "Returned items summary" },
      { key: "transportArrangements", label: "Transport Arrangements", placeholder: "Family pickup / official transport" },
    ],
  },
  {
    key: "postReleaseMonitoring",
    group: "release",
    title: "Post-Release Monitoring Form",
    description: "Track reporting schedule, address checks, work status, and violations.",
    accent: "#f7c948",
    fields: [
      { key: "reportingSchedule", label: "Reporting Schedule", placeholder: "Weekly / Monthly" },
      { key: "addressVerification", label: "Address Verification", placeholder: "Verified / Pending" },
      { key: "employmentStatus", label: "Employment Status", placeholder: "Employed / Unemployed / Training" },
      { key: "violations", label: "Violations", type: "textarea", rows: 4, placeholder: "Any post-release violations" },
    ],
  },
]

const TAB_META: Record<TabKey, { label: string; icon: ComponentType<{ className?: string }> }> = {
  admission: { label: "Admission", icon: ClipboardCheck },
  sentence: { label: "Sentence", icon: Activity },
  parole: { label: "Parole", icon: UserRoundCheck },
  release: { label: "Release", icon: ShieldCheck },
}

function buildInitialForms(selectedCase: CaseData | null) {
  const base: Record<string, Record<string, string>> = {}
  const sentencing = selectedCase?.sentencingRecord?.latestEntry || {}
  const charge = text(selectedCase?.charge || selectedCase?.policeSections?.sectionA?.allegedCrime || "", "")
  const location = text(selectedCase?.district || selectedCase?.policeSections?.sectionA?.whereCommittedSpecify || "", "")
  const partyName = text(selectedCase?.parties || selectedCase?.policeSections?.sectionA?.aggrievedFullName || "", "")

  for (const section of SECTIONS) {
    const latest =
      selectedCase?.correctionalWorkflow?.[section.key]?.latestEntry ||
      (section.key === "inmateIntake" ? selectedCase?.correctionalIntake?.latestEntry : null) ||
      ((section.key === "releaseForm" || section.key === "paroleDecision" || section.key === "paroleEligibility")
        ? selectedCase?.paroleReleaseRecord?.latestEntry
        : null) ||
      {}

    const defaults: Record<string, string> = {}
    for (const field of section.fields) {
      defaults[field.key] = String((latest as any)?.[field.key] || "")
    }

    if (section.key === "inmateIntake") {
      defaults.fullName ||= partyName
      defaults.caseReference ||= text(selectedCase?.caseNumber || "", "")
      defaults.courtName ||= text(sentencing.courtName || selectedCase?.courtName || "", "")
      defaults.offenceCharge ||= charge
      defaults.convictionDate ||= String(sentencing.dateOfSentence || "")
      defaults.sentenceLength ||= String(sentencing.sentenceLength || "")
      defaults.sentenceStartDate ||= String(sentencing.dateOfSentence || "")
      defaults.expectedReleaseDate ||= String(sentencing.expectedReleaseDate || "")
      defaults.transferredFrom ||= "Court"
      defaults.admissionDate ||= todayDate()
    }

    if (section.key === "prisonerClassification") {
      defaults.assignedFacility ||= text(selectedCase?.correctionalIntake?.latestEntry?.facility || "", "")
    }

    if (section.key === "sentenceExecution") {
      defaults.sentenceStartDate ||= String(sentencing.dateOfSentence || todayDate())
    }

    if (section.key === "paroleEligibility") defaults.recommendation ||= "approve"
    if (section.key === "paroleDecision") defaults.decision ||= "approved"
    if (section.key === "releaseForm") defaults.releaseType ||= "completed_sentence"

    defaults.incidentLocation ||= location
    base[section.key] = defaults
  }

  return base
}

function WorkflowSectionCard({
  section,
  values,
  onField,
  onSave,
  saving,
}: {
  section: SectionConfig
  values: Record<string, string>
  onField: (fieldKey: string, value: string) => void
  onSave: () => void
  saving?: boolean
}) {
  return (
    <Card className={panelClass()}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Correctional Form</div>
            <div className="mt-1 text-lg font-semibold text-white">{section.title}</div>
            <div className="mt-1 text-sm text-white/56">{section.description}</div>
          </div>
          <div className="h-3 w-3 rounded-full" style={{ background: section.accent }} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {section.fields.map((field) => {
            const value = values[field.key] || ""
            const type = field.type || "text"

            if (type === "textarea") {
              return (
                <div key={field.key} className="space-y-2 md:col-span-2">
                  <Label className="text-white/78">{field.label}</Label>
                  <Textarea
                    rows={field.rows || 4}
                    value={value}
                    placeholder={field.placeholder}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
                    onChange={(e) => onField(field.key, e.target.value)}
                  />
                </div>
              )
            }

            if (type === "select") {
              return (
                <div key={field.key} className="space-y-2">
                  <Label className="text-white/78">{field.label}</Label>
                  <Select value={value} onValueChange={(next) => onField(field.key, next)}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((option) => (
                        <SelectItem key={`${field.key}-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            }

            return (
              <div key={field.key} className="space-y-2">
                <Label className="text-white/78">{field.label}</Label>
                <Input
                  type={type}
                  value={value}
                  placeholder={field.placeholder}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
                  onChange={(e) => onField(field.key, e.target.value)}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            disabled={saving}
            className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95 disabled:opacity-60"
            onClick={onSave}
          >
            {saving ? "Saving & Anchoring..." : `Save ${section.title}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CorrectionalWorkflowWorkspace({
  title,
  intro,
  initialTab = "admission",
  allowedTabs,
}: {
  title: string
  intro: string
  initialTab?: TabKey
  allowedTabs?: TabKey[]
}) {
  const store = useStore() as any
  const currentUser = store.currentUser as User | null
  const getAllCases = store.getAllCases ?? (() => [])
  const updateCase = store.updateCase ?? (() => {})
  const appendCaseActivity = store.appendCaseActivity ?? (() => {})

  const queue = useMemo(
    () =>
      (getAllCases() as CaseData[]).filter((item) =>
        ["sentenced", "transferred_to_correctional_services", "serving_sentence", "parole_review", "released"].includes(
          String(item.status || "").toLowerCase()
        )
      ),
    [getAllCases]
  )

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const visibleTabs = allowedTabs && allowedTabs.length > 0 ? allowedTabs : (Object.keys(TAB_META) as TabKey[])
  const safeInitialTab = visibleTabs.includes(initialTab) ? initialTab : visibleTabs[0]
  const [activeTab, setActiveTab] = useState<TabKey>(safeInitialTab)
  const [forms, setForms] = useState<Record<string, Record<string, string>>>(() => buildInitialForms(null))
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const selectedCase = useMemo(
    () => queue.find((item) => item.caseId === selectedCaseId) || null,
    [queue, selectedCaseId]
  )

  useEffect(() => {
    if (!selectedCaseId && queue[0]) setSelectedCaseId(queue[0].caseId)
  }, [queue, selectedCaseId])

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0])
    }
  }, [activeTab, visibleTabs])

  useEffect(() => {
    setForms(buildInitialForms(selectedCase))
  }, [selectedCase])

  function setField(sectionKey: string, fieldKey: string, value: string) {
    setForms((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value,
      },
    }))
  }

  async function saveSection(section: SectionConfig) {
    setMessage("")
    setError("")

    if (!currentUser || !selectedCase) {
      setError("Select a correctional case before saving.")
      return
    }

    const values = forms[section.key] || {}
    for (const requiredKey of section.requiredKeys || []) {
      if (!String(values[requiredKey] || "").trim()) {
        const field = section.fields.find((item) => item.key === requiredKey)
        setError(`${field?.label || requiredKey} is required for ${section.title}.`)
        return
      }
    }

    setSavingKey(section.key)

    const actorName = currentUser.name || currentUser.fullName || "Correctional Officer"
    const submittedAt = new Date().toISOString()
    const entry: Record<string, any> = {
      ...values,
      submittedAt,
      submittedById: currentUser.id,
      submittedByName: actorName,
    }

    const correctionalWorkflow = {
      ...(selectedCase.correctionalWorkflow || {}),
      [section.key]: {
        entries: [entry, ...(selectedCase.correctionalWorkflow?.[section.key]?.entries || [])],
        latestEntry: entry,
      },
    }

    const patch: Partial<CaseData> = { correctionalWorkflow }
    let activityType: PublicActivityType | null = null
    let activityMessage = `${section.title} saved for ${selectedCase.caseNumber || selectedCase.caseId}.`
    let activityMetadata: Record<string, any> = { module: "correctional_workflow", section: section.key }
    let anchorWarning = ""

    if (["inmateIntake", "paroleDecision", "releaseForm"].includes(section.key)) {
      try {
        const action =
          section.key === "inmateIntake"
            ? "CORRECTIONAL_INTAKE_RECORDED"
            : section.key === "paroleDecision"
              ? "PAROLE_DECISION_RECORDED"
              : "OFFENDER_RELEASE_RECORDED"

        const response = await fetch("/api/blockchain/anchor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: `${selectedCase.caseId}:${section.key}:${submittedAt}`,
            action,
            caseData: {
              caseId: selectedCase.caseId,
              caseNumber: selectedCase.caseNumber,
              statusBeforeUpdate: selectedCase.status,
              section: section.key,
              values,
              actorName,
              submittedAt,
            },
          }),
        })

        const anchorResult = await response.json()
        if (!response.ok || !anchorResult?.ok) {
          throw new Error(anchorResult?.error || "Blockchain anchor failed")
        }

        entry.blockchainAnchor = {
          transactionId: anchorResult.transactionId || anchorResult.txHash,
          txHash: anchorResult.txHash,
          blockNumber: anchorResult.blockNumber,
          contentHash: anchorResult.contentHash,
          channelName: anchorResult.channelName,
          chaincodeName: anchorResult.chaincodeName,
          anchoredAt: submittedAt,
          action,
        }

        if (anchorResult.warning) {
          anchorWarning = anchorResult.warning
        }
      } catch (anchorError: any) {
        setSavingKey(null)
        setError(anchorError?.message || "Blockchain anchor failed for this correctional action.")
        return
      }
    }

    if (section.key === "inmateIntake") {
      patch.status = "serving_sentence"
      ;(patch as any).correctionalIntake = {
        entries: [entry, ...(selectedCase.correctionalIntake?.entries || [])],
        latestEntry: entry,
      }
      ;(patch as any).correctional = {
        ...(selectedCase.correctional || {}),
        admittedAt: submittedAt,
        receivedByName: actorName,
        inmateId: values.nationalId || values.caseReference || "",
      }
      activityType = "offender_admitted"
      activityMessage = `Offender admitted into correctional services for ${selectedCase.caseNumber || selectedCase.caseId}.`
      activityMetadata = { ...activityMetadata, inmateName: values.fullName, courtName: values.courtName }
    }

    if (section.key === "paroleEligibility") {
      patch.status = "parole_review"
      ;(patch as any).correctional = {
        ...(selectedCase.correctional || {}),
        paroleReviewAt: submittedAt,
        paroleReviewByName: actorName,
      }
      activityType = "parole_review_scheduled"
      activityMessage = `Parole review scheduled for ${selectedCase.caseNumber || selectedCase.caseId}.`
      activityMetadata = { ...activityMetadata, recommendation: values.recommendation }
    }

    if (section.key === "paroleDecision") {
      patch.status = "parole_review"
      ;(patch as any).paroleReleaseRecord = {
        entries: [entry, ...(selectedCase.paroleReleaseRecord?.entries || [])],
        latestEntry: entry,
      }
    }

    if (section.key === "releaseForm") {
      patch.status = "released"
      ;(patch as any).paroleReleaseRecord = {
        entries: [entry, ...(selectedCase.paroleReleaseRecord?.entries || [])],
        latestEntry: entry,
      }
      ;(patch as any).correctional = {
        ...(selectedCase.correctional || {}),
        releasedAt: submittedAt,
        releasedByName: actorName,
      }
      activityType = "offender_released"
      activityMessage = `Release recorded for ${selectedCase.caseNumber || selectedCase.caseId}.`
      activityMetadata = { ...activityMetadata, releaseType: values.releaseType }
    }

    if (entry.blockchainAnchor) {
      ;(patch as any).correctional = {
        ...((patch as any).correctional || selectedCase.correctional || {}),
        blockchain: {
          ...((selectedCase.correctional || {}).blockchain || {}),
          [section.key]: entry.blockchainAnchor,
        },
      }
      activityMetadata = {
        ...activityMetadata,
        blockchainTxHash: entry.blockchainAnchor.txHash,
        blockchainContentHash: entry.blockchainAnchor.contentHash,
      }
    }

    updateCase(selectedCase.caseId, patch)
    if (activityType) {
      appendCaseActivity({
        caseId: selectedCase.caseId,
        type: activityType,
        actorName,
        actorRole: "internal",
        message: activityMessage,
        metadata: activityMetadata,
      })
    }

    setSavingKey(null)
    setMessage(
      anchorWarning
        ? `${section.title} saved. ${anchorWarning}`
        : entry.blockchainAnchor
          ? `${section.title} saved and anchored to blockchain.`
          : `${section.title} saved successfully.`
    )
  }

  const totalRecordedSections = selectedCase
    ? SECTIONS.filter((section) => selectedCase.correctionalWorkflow?.[section.key]?.latestEntry).length
    : 0

  const sectionsForTab = (tab: TabKey) => SECTIONS.filter((section) => section.group === tab)

  return (
    <DashboardLayout allowedRoles={["correctional_services", "correctional_admin"]} title={title}>
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Correctional Lifecycle Workspace</div>
                  <div className="mt-1 text-lg font-semibold text-white">{title}</div>
                  <div className="text-sm text-white/52">{intro}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Admission</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{queue.filter((item) => ["sentenced", "transferred_to_correctional_services"].includes(String(item.status || "").toLowerCase())).length}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Serving</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{queue.filter((item) => String(item.status || "").toLowerCase() === "serving_sentence").length}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Parole</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{queue.filter((item) => String(item.status || "").toLowerCase() === "parole_review").length}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Released</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{queue.filter((item) => String(item.status || "").toLowerCase() === "released").length}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                <Label className="text-white/76">Correctional Case</Label>
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select correctional case" />
                  </SelectTrigger>
                  <SelectContent>
                    {queue.map((item) => (
                      <SelectItem key={item.caseId} value={item.caseId}>
                        {text(item.caseNumber)} | {text(item.charge)} | {formatStatus(item.status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Current Status</div>
                    <div className="mt-1 text-sm font-semibold text-white">{selectedCase ? formatStatus(selectedCase.status) : "Select case"}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Completed Forms</div>
                    <div className="mt-1 text-sm font-semibold text-white">{totalRecordedSections} / {SECTIONS.length}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1rem] border border-cyan-400/18 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50/92">
                Correctional services continue the lifecycle of the case after court completion by managing custody, rehabilitation, and release, while maintaining full traceability.
              </div>
            </div>
          </div>
        </section>

        {message ? <div className="rounded-[0.95rem] border border-cyan-400/20 bg-cyan-400/10 px-3 py-2.5 text-sm text-cyan-50">{message}</div> : null}
        {error ? <div className="rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-100">{error}</div> : null}

        {selectedCase ? (
          <>
            <section className={panelClass()}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Selected Offender Packet</div>
                    <div className="mt-1 text-lg font-semibold text-white">{text(selectedCase.caseNumber || "Protected reference")}</div>
                    <div className="text-sm text-white/56">{text(selectedCase.parties || selectedCase.policeSections?.sectionA?.aggrievedFullName || "Unknown offender / complainant")}</div>
                  </div>
                  <Badge className="w-fit border-0 bg-cyan-500/15 px-3 py-1 text-cyan-100">{formatStatus(selectedCase.status)}</Badge>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-4">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Case Reference</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.caseNumber)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Charge</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.charge || selectedCase.policeSections?.sectionA?.allegedCrime)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Location</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.district || selectedCase.policeSections?.sectionA?.whereCommittedSpecify)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Recorded Forms</div>
                    <div className="mt-1 text-sm font-medium text-white">{totalRecordedSections}</div>
                  </div>
                </div>
              </CardContent>
            </section>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1rem] bg-[rgba(16,27,52,0.96)] p-2">
                {visibleTabs.map((tab) => {
                  const Icon = TAB_META[tab].icon
                  return (
                    <TabsTrigger key={tab} value={tab} className="min-w-[150px] rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2 text-white data-[state=active]:border-cyan-300/30 data-[state=active]:bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(90,140,255,0.2))] data-[state=active]:text-white">
                      <Icon className="h-4 w-4" />
                      {TAB_META[tab].label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {visibleTabs.map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="grid gap-4">
                    {sectionsForTab(tab).map((section) => (
                      <WorkflowSectionCard
                        key={section.key}
                        section={section}
                        values={forms[section.key] || {}}
                        onField={(fieldKey, value) => setField(section.key, fieldKey, value)}
                        onSave={() => saveSection(section)}
                        saving={savingKey === section.key}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <Card className={panelClass()}>
            <CardContent className="p-8 text-center text-sm text-white/56">
              No sentenced or correctional cases are available yet. As soon as a court-completed case reaches correctional services, the full admission, management, parole, and release workflow will open here.
            </CardContent>
          </Card>
        )}

        <section className="grid gap-3 lg:grid-cols-4">
          {[
            { title: "Admission", text: "Court convicts offender, correctional receives inmate, then intake, classification, medical, property, and biometric capture begin.", icon: Fingerprint },
            { title: "Management", text: "Sentence execution, behavior, incidents, visitors, and rehabilitation stay append-only for custody traceability.", icon: HeartPulse },
            { title: "Parole", text: "Parole eligibility and board decision remain visible as a controlled review stage before final release.", icon: Users },
            { title: "Release", text: "Release and post-release monitoring preserve property return, conditions, reporting schedules, and supervision trail.", icon: Package },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className={panelClass()}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] bg-white/8">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-base font-semibold text-white">{item.title}</div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-white/58">{item.text}</div>
                </CardContent>
              </Card>
            )
          })}
        </section>
      </div>
    </DashboardLayout>
  )
}
