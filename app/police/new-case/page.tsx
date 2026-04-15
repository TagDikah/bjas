"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Send } from "lucide-react"
import { PoliceOfficerShell } from "@/components/police-officer-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function fieldClass() {
  return "border-white/12 bg-white/5 text-white placeholder:text-white/35"
}

const whereCommittedOptions = [
  "BANK","DRINKING_CLUB","RESTAURANT","CARPARK","CHURCH","HOME","SCHOOL","FACTORY","FARM_LANDS",
  "HOSPITAL","HOTEL","OFFICE","STREET","SHOP_SUPERMARKET","KRAAL","SPECIFY"
]

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toTimeInputValue(date: Date) {
  return date.toTimeString().slice(0, 5)
}

function makeAutoCrimeNo() {
  const now = new Date()
  return `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`
}

function makeStationCode(station?: string) {
  const value = String(station || "LMPS")
  const initials = value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")

  return (initials || value.slice(0, 4)).slice(0, 6)
}

function calculateAgeFromDob(dateOfBirth: string) {
  if (!dateOfBirth) return ""
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return ""

  const today = new Date()
  let years = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years -= 1
  }
  return years >= 0 ? String(years) : ""
}

function getDraftSnapshotKey(userId?: string | null, caseId?: string | null, caseNumber?: string | null) {
  const stableId = String(caseId || caseNumber || "new").trim() || "new"
  const actor = String(userId || "anonymous").trim() || "anonymous"
  return `bejas:police-draft:${actor}:${stableId}`
}

function getResumeStepIndex(caseData: any, totalSteps: number) {
  const explicitCurrentStep = Number(caseData?.policeSections?.sectionA?.currentEditingStepIndex ?? -1)
  const lockedThrough = Number(caseData?.policeSections?.sectionA?.checkpointLockedThrough ?? -1)
  const lastCheckpoint = Number(caseData?.policeSections?.sectionA?.lastCheckpointStepIndex ?? -1)
  if (explicitCurrentStep >= 0) {
    return Math.max(0, Math.min(totalSteps - 1, explicitCurrentStep))
  }
  const nextStep = lockedThrough >= 0 ? lockedThrough + 1 : lastCheckpoint >= 0 ? lastCheckpoint + 1 : 0
  return Math.max(0, Math.min(totalSteps - 1, nextStep))
}

function PoliceNewCaseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cases = useStore((state) => state.cases)
  const { currentUser, createCase, addCase, updateCase } = useStore()
  const now = React.useMemo(() => new Date(), [])
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [step, setStep] = React.useState(0)
  const [checkpointCaseId, setCheckpointCaseId] = React.useState("")
  const [lockedThroughStep, setLockedThroughStep] = React.useState(-1)
  const [nextArmed, setNextArmed] = React.useState(false)
  const [stepMessage, setStepMessage] = React.useState<string | null>(null)
  const [checkpointErrors, setCheckpointErrors] = React.useState<Array<{ stepIndex: number; stepKey: string; at: string; message: string }>>([])
  const [caseNumber, setCaseNumber] = React.useState(() => {
    const y = new Date().getFullYear()
    const n = Math.floor(10000 + Math.random() * 90000)
    return `LMPS-${y}-${n}`
  })

  const [stnCode, setStnCode] = React.useState("")
  const [crimeNo, setCrimeNo] = React.useState(makeAutoCrimeNo())
  const [crimeYear, setCrimeYear] = React.useState(String(new Date().getFullYear()))
  const [crimeRegion, setCrimeRegion] = React.useState("")

  const [dateReported, setDateReported] = React.useState(toDateInputValue(now))
  const [timeReported, setTimeReported] = React.useState(toTimeInputValue(now))
  const [methodOfComplaint, setMethodOfComplaint] = React.useState<"discovered_by_police" | "reported_by_victim" | "other_person" | "unknown">("unknown")
  const [reportingPersonFullName, setReportingPersonFullName] = React.useState("")
  const [reportingAddress, setReportingAddress] = React.useState("")
  const [complainantStatement, setComplainantStatement] = React.useState("")

  const [aggrievedFullName, setAggrievedFullName] = React.useState("")
  const [aggrievedAddress, setAggrievedAddress] = React.useState("")
  const [sex, setSex] = React.useState("")
  const [age, setAge] = React.useState("")
  const [dateOfBirth, setDateOfBirth] = React.useState("")

  const [allegedCrime, setAllegedCrime] = React.useState("")
  const [attempt, setAttempt] = React.useState(false)
  const [whereCommitted, setWhereCommitted] = React.useState<string>("")
  const [whereCommittedSpecify, setWhereCommittedSpecify] = React.useState("")

  const [whenFromDate, setWhenFromDate] = React.useState("")
  const [whenFromTime, setWhenFromTime] = React.useState("")
  const [whenToDate, setWhenToDate] = React.useState("")
  const [whenToTime, setWhenToTime] = React.useState("")

  const [modusOperandi, setModusOperandi] = React.useState("")
  const [propertyOrInjury, setPropertyOrInjury] = React.useState("")
  const [propertyType, setPropertyType] = React.useState("")
  const [propertyDescription, setPropertyDescription] = React.useState("")
  const [propertyIdentifier, setPropertyIdentifier] = React.useState("")
  const [propertyEstimatedValue, setPropertyEstimatedValue] = React.useState("")

  const [drinkRelated, setDrinkRelated] = React.useState<"offender" | "victim" | "both" | "not_known" | "not_involved">("not_known")
  const [drugRelated, setDrugRelated] = React.useState<"offender" | "victim" | "both" | "not_known" | "not_involved">("not_known")

  const [firearmUsed, setFirearmUsed] = React.useState<"pistol_revolver" | "rifle" | "shotgun" | "discharged" | "yes" | "no" | "unknown">("unknown")
  const [firearmSpecify, setFirearmSpecify] = React.useState("")
  const [weaponUsed, setWeaponUsed] = React.useState<"knife" | "stick" | "stone" | "scissors" | "yes" | "no" | "unknown">("unknown")
  const [weaponSpecify, setWeaponSpecify] = React.useState("")

  const [extentOfInjury, setExtentOfInjury] = React.useState<"slight" | "serious_hospital" | "dead" | "none" | "unknown">("unknown")
  const [offenderVictimRelationship, setOffenderVictimRelationship] = React.useState<
    | "friend"
    | "colleague"
    | "family_relative"
    | "married_spouse"
    | "same_household"
    | "neighbor"
    | "employee_employer"
    | "classmate"
    | "no_relationship"
    | "not_known"
  >("not_known")
  const [victimStatementTaken, setVictimStatementTaken] = React.useState(false)

  const [suspectDetails, setSuspectDetails] = React.useState("")
  const [witnessList, setWitnessList] = React.useState("")
  const stepKeys = ["header", "complaint", "incident", "flags_suspect"]
  const steps = [
    "Header",
    "Complaint & Complainant",
    "Incident",
    "Flags & Suspect",
  ]
  const resumeCaseId = String(searchParams.get("caseId") || "").trim()
  const resumeCase = React.useMemo(
    () => (resumeCaseId ? cases.find((item) => item.caseId === resumeCaseId) ?? null : null),
    [cases, resumeCaseId]
  )
  const initializedResumeRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!currentUser) return

    if (!stnCode) setStnCode(makeStationCode(currentUser.station))
    if (!crimeRegion) setCrimeRegion(currentUser.station || "HQ")
  }, [currentUser, stnCode, crimeRegion])

  const generatedPropertySummary = React.useMemo(() => {
    const parts = [
      propertyType ? `Type: ${propertyType}` : "",
      propertyDescription ? `Description: ${propertyDescription}` : "",
      propertyIdentifier ? `Serial/Registration: ${propertyIdentifier}` : "",
      propertyEstimatedValue ? `Estimated value: ${propertyEstimatedValue}` : "",
    ].filter(Boolean)

    return parts.join(" | ")
  }, [propertyType, propertyDescription, propertyIdentifier, propertyEstimatedValue])

  React.useEffect(() => {
    if (!resumeCase || initializedResumeRef.current === resumeCase.caseId) return

    const sectionA = resumeCase.policeSections?.sectionA ?? {}
    const snapshotKey = getDraftSnapshotKey(currentUser?.id, resumeCase.caseId, resumeCase.caseNumber)
    let localSnapshot: Record<string, any> = {}
    try {
      localSnapshot = JSON.parse(localStorage.getItem(snapshotKey) || "{}")
    } catch {}
    const snapshotSectionA = localSnapshot?.policeSections?.sectionA ?? {}
    const mergedSectionA = { ...sectionA, ...snapshotSectionA }
    initializedResumeRef.current = resumeCase.caseId

    setCaseNumber(String(resumeCase.caseNumber || caseNumber))
    setCheckpointCaseId(resumeCase.caseId)
    setLockedThroughStep(Number(mergedSectionA.checkpointLockedThrough ?? sectionA.checkpointLockedThrough ?? -1))
    setStep(
      getResumeStepIndex(
        {
          ...resumeCase,
          policeSections: {
            ...resumeCase.policeSections,
            sectionA: mergedSectionA,
          },
        },
        steps.length
      )
    )
    setNextArmed(false)
    setStepMessage("Draft restored. Continue from where you left off.")
    setSubmitError(null)
    setCheckpointErrors(Array.isArray(mergedSectionA.stepCheckpointErrors) ? mergedSectionA.stepCheckpointErrors : [])

    setStnCode(String(mergedSectionA.stnCode || makeStationCode(currentUser?.station)))
    setCrimeNo(String(mergedSectionA.crimeNo || makeAutoCrimeNo()))
    setCrimeYear(String(mergedSectionA.crimeYear || new Date(resumeCase.createdAt || Date.now()).getFullYear()))
    setCrimeRegion(String(mergedSectionA.crimeRegion || currentUser?.station || "HQ"))
    setDateReported(String(mergedSectionA.dateReported || toDateInputValue(now)))
    setTimeReported(String(mergedSectionA.timeReported || toTimeInputValue(now)))
    setMethodOfComplaint(mergedSectionA.methodOfComplaint || "unknown")
    setReportingPersonFullName(String(mergedSectionA.reportingPersonFullName || ""))
    setReportingAddress(String(mergedSectionA.reportingAddress || ""))
    setComplainantStatement(String(mergedSectionA.complainantStatement || ""))
    setAggrievedFullName(String(mergedSectionA.aggrievedFullName || ""))
    setAggrievedAddress(String(mergedSectionA.aggrievedAddress || ""))
    setSex(String(mergedSectionA.sex || ""))
    setAge(String(mergedSectionA.age || calculateAgeFromDob(String(mergedSectionA.dateOfBirth || ""))))
    setDateOfBirth(String(mergedSectionA.dateOfBirth || ""))
    setAllegedCrime(String(mergedSectionA.allegedCrime || ""))
    setAttempt(Boolean(mergedSectionA.attempt))
    setWhereCommitted(String(mergedSectionA.whereCommitted || ""))
    setWhereCommittedSpecify(String(mergedSectionA.whereCommittedSpecify || ""))
    setWhenFromDate(String(mergedSectionA.whenFromDate || ""))
    setWhenFromTime(String(mergedSectionA.whenFromTime || ""))
    setWhenToDate(String(mergedSectionA.whenToDate || ""))
    setWhenToTime(String(mergedSectionA.whenToTime || ""))
    setModusOperandi(String(mergedSectionA.modusOperandi || ""))
    setPropertyOrInjury(String(mergedSectionA.propertyOrInjury || ""))
    setPropertyType(String(mergedSectionA.propertyType || ""))
    setPropertyDescription(String(mergedSectionA.propertyDescription || ""))
    setPropertyIdentifier(String(mergedSectionA.propertyIdentifier || ""))
    setPropertyEstimatedValue(String(mergedSectionA.propertyEstimatedValue || ""))
    setDrinkRelated(mergedSectionA.drinkRelated || "not_known")
    setDrugRelated(mergedSectionA.drugRelated || "not_known")
    setFirearmUsed(mergedSectionA.firearmUsed || "unknown")
    setFirearmSpecify(String(mergedSectionA.firearmSpecify || ""))
    setWeaponUsed(mergedSectionA.weaponUsed || "unknown")
    setWeaponSpecify(String(mergedSectionA.weaponSpecify || ""))
    setExtentOfInjury(mergedSectionA.extentOfInjury || "unknown")
    setOffenderVictimRelationship(mergedSectionA.offenderVictimRelationship || "not_known")
    setVictimStatementTaken(Boolean(mergedSectionA.victimStatementTaken))
    setSuspectDetails(String(mergedSectionA.suspectDetails || ""))
    setWitnessList(String(mergedSectionA.witnessList || ""))
  }, [resumeCase, currentUser, now, steps.length, caseNumber])

  const buildCasePayload = () => ({
    // Presentation note: this converts all form inputs into one structured case object that the backend can save and anchor.
    caseNumber,
    citation: "",
    district: currentUser.station || "UNKNOWN",
    parties: aggrievedFullName || reportingPersonFullName || "UNKNOWN",
    charge: allegedCrime || "UNKNOWN",
    description: modusOperandi || "N/A",
    evidence: [],
    policeOfficerId: currentUser.id,
    policeOfficerName: currentUser.name,
    policeStationId: currentUser.station || "UNKNOWN",
    policeSections: {
      sectionA: {
        openedById: currentUser.id,
        openedByName: currentUser.name,
        openedAt: resumeCase?.policeSections?.sectionA?.openedAt || new Date().toISOString(),
        station: currentUser.station || "UNKNOWN",
        stnCode,
        crimeNo,
        crimeYear,
        crimeRegion,
        dateReported,
        timeReported,
        methodOfComplaint,
        reportingPersonFullName,
        reportingAddress,
        complainantStatement,
        aggrievedFullName,
        aggrievedAddress,
        sex,
        age,
        dateOfBirth,
        allegedCrime,
        attempt,
        whereCommitted,
        whereCommittedSpecify,
        whenFromDate,
        whenFromTime,
        whenToDate,
        whenToTime,
        modusOperandi,
        propertyOrInjury,
        propertyType,
        propertyDescription,
        propertyIdentifier,
        propertyEstimatedValue,
        drinkRelated,
        drugRelated,
        firearmUsed,
        firearmSpecify,
        weaponUsed,
        weaponSpecify,
        extentOfInjury,
        offenderVictimRelationship,
        victimStatementTaken,
        suspectDetails,
        witnessList,
        currentEditingStepIndex: step,
        currentEditingStepKey: stepKeys[step] || `step_${step + 1}`,
        draftLastSavedAt: new Date().toISOString(),
        stepCheckpointErrors: checkpointErrors,
        recComplainantOfficer: currentUser.name,
        investigatorOfficerNameNumber: currentUser.badge ? `${currentUser.name} (${currentUser.badge})` : currentUser.name,
        investigatorUnit: currentUser.department || "POLICE",
        supervisor: "",
        stationArrestNumber: "",
        detectedBy: "unknown",
        complainantName: aggrievedFullName || reportingPersonFullName,
        accusedName: "",
        location: whereCommittedSpecify || whereCommitted,
        summary: modusOperandi,
      },
    },
  })

  const saveDraft = () => {
    const payload = buildCasePayload()
    const existingCaseId = resumeCase?.caseId || checkpointCaseId

    if (existingCaseId) {
      const nowIso = new Date().toISOString()
      const alreadyInStore = cases.some((item) => item.caseId === existingCaseId)
      const draftCase = {
        ...payload,
        caseId: existingCaseId,
        status: "draft_police",
        createdAt: resumeCase?.createdAt || nowIso,
        updatedAt: nowIso,
      }

      if (alreadyInStore) {
        updateCase(existingCaseId, {
          ...payload,
          status: "draft_police",
        })
      } else {
        addCase(draftCase as any)
      }

      router.push(`/police/case/${existingCaseId}`)
      return
    }

    const created = createCase(payload)
    setCheckpointCaseId(created.caseId)
    router.push(`/police/case/${created.caseId}`)
  }

  const submitNow = async () => {
    // Presentation note: this sends the completed case to the API so it is stored in TiDB and anchored on blockchain.
    setSubmitting(true)
    setSubmitError(null)
    try {
      const finalCaseId = checkpointCaseId || undefined
      const response = await fetch(finalCaseId ? "/api/cases/finalize" : "/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: finalCaseId,
          caseData: buildCasePayload(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok || !data?.case?.caseId) {
        throw new Error(data?.error || "Failed to submit case to DB and blockchain.")
      }

      if (cases.some((item) => item.caseId === data.case.caseId)) {
        updateCase(data.case.caseId, data.case)
      } else {
        addCase(data.case)
      }
      try {
        localStorage.removeItem(getDraftSnapshotKey(currentUser.id, data.case.caseId, data.case.caseNumber))
      } catch {}
      router.push(`/police/case/${data.case.caseId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit case."
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }
  const canGoBack = step > 0 && step > lockedThroughStep + 1

  const checkpointAndProceed = async () => {
    // Presentation note: this locks each form step, saves progress, and creates a blockchain checkpoint before moving forward.
    if (!nextArmed) {
      setNextArmed(true)
      setStepMessage("Verify this step is fully completed, then click Next again to lock and continue.")
      return
    }

    if (!currentUser) return

    const stepKey = stepKeys[step] || `step_${step + 1}`
    setStepMessage(null)

    try {
      const response = await fetch("/api/cases/checkpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: checkpointCaseId || undefined,
          stepIndex: step,
          stepKey,
          caseData: buildCasePayload(),
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.ok) {
        const msg = String(data?.error || "Failed to checkpoint this step.")
        setCheckpointErrors((prev) => [
          ...prev,
          { stepIndex: step, stepKey, at: new Date().toISOString(), message: msg },
        ])
        setSubmitError(msg)
        return
      }

      const newCaseId = String(data?.result?.caseId || checkpointCaseId || "")
      const checkpointedCase = data?.result?.caseData
      if (checkpointedCase?.caseId) {
        if (cases.some((item) => item.caseId === checkpointedCase.caseId)) {
          updateCase(checkpointedCase.caseId, checkpointedCase)
        } else {
          addCase(checkpointedCase)
        }
      }
      if (newCaseId) setCheckpointCaseId(newCaseId)
      setLockedThroughStep(
        Math.max(
          step,
          Number(checkpointedCase?.policeSections?.sectionA?.checkpointLockedThrough ?? -1)
        )
      )
      setNextArmed(false)
      setStepMessage("Step locked and anchored to blockchain.")
      setStep((s) => Math.min(steps.length - 1, s + 1))
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to checkpoint this step."
      setCheckpointErrors((prev) => [
        ...prev,
        { stepIndex: step, stepKey, at: new Date().toISOString(), message: msg },
      ])
      setSubmitError(msg)
    }
  }

  const isCurrentStepLocked = step <= lockedThroughStep
  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1

  React.useEffect(() => {
    if (!currentUser) return

    const payload = buildCasePayload()
    const snapshotCaseId = checkpointCaseId || resumeCase?.caseId || ""
    const snapshotKey = getDraftSnapshotKey(currentUser.id, snapshotCaseId, caseNumber)

    try {
      localStorage.setItem(
        snapshotKey,
        JSON.stringify({
          caseId: snapshotCaseId || null,
          caseNumber,
          policeSections: payload.policeSections,
          updatedAt: new Date().toISOString(),
        })
      )
    } catch {
      // Ignore local snapshot failures and keep the form usable.
    }
  }, [
    currentUser,
    checkpointCaseId,
    resumeCase?.caseId,
    caseNumber,
    step,
    stnCode,
    crimeNo,
    crimeYear,
    crimeRegion,
    dateReported,
    timeReported,
    methodOfComplaint,
    reportingPersonFullName,
    reportingAddress,
    complainantStatement,
    aggrievedFullName,
    aggrievedAddress,
    sex,
    age,
    dateOfBirth,
    allegedCrime,
    attempt,
    whereCommitted,
    whereCommittedSpecify,
    whenFromDate,
    whenFromTime,
    whenToDate,
    whenToTime,
    modusOperandi,
    propertyOrInjury,
    propertyType,
    propertyDescription,
    propertyIdentifier,
    propertyEstimatedValue,
    drinkRelated,
    drugRelated,
    firearmUsed,
    firearmSpecify,
    weaponUsed,
    weaponSpecify,
    extentOfInjury,
    offenderVictimRelationship,
    victimStatementTaken,
    suspectDetails,
    witnessList,
    checkpointErrors,
  ])

  if (!currentUser) {
    return (
      <PoliceOfficerShell title="Open New Case" contentClassName="space-y-4">
        <div className="text-sm text-muted-foreground">Please log in as Police Officer.</div>
      </PoliceOfficerShell>
    )
  }

  return (
    <PoliceOfficerShell title="Case Opening & Amendment (LMPS C1/C2)" contentClassName="space-y-4">
      <div className="space-y-4">
        <div className={`${panelClass("sticky top-3 z-10")} p-3 lg:p-4`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border-white/12 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/police/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
              </Button>
              <div className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-100">
                Step {step + 1} of {steps.length}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white" onClick={saveDraft}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white hover:opacity-95" onClick={submitNow} disabled={submitting}><Send className="mr-2 h-4 w-4" />{submitting ? "Sending..." : "Send Case"}</Button>
            </div>
          </div>
        </div>

        {submitError ? (
          <div className="rounded-[0.95rem] border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {submitError}
          </div>
        ) : null}

        <Card className={panelClass()}>
          <CardContent className="p-3 lg:p-4">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Police Intake Workspace</div>
                <div className="mt-1 text-base font-semibold text-white">{steps[step]}</div>
                <div className="mt-1 text-xs text-white/52">
                  Complete the current form section, save draft any time, and use the step controls to checkpoint progress.
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {steps.map((label, index) => {
                  const active = index === step
                  const locked = index <= lockedThroughStep
                  return (
                    <div
                      key={label}
                      className={`rounded-[0.85rem] border px-2.5 py-2 ${
                        active
                          ? "border-cyan-400/25 bg-cyan-400/10"
                          : locked
                            ? "border-emerald-400/20 bg-emerald-400/10"
                            : "border-white/8 bg-white/5"
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Step {index + 1}</div>
                      <div className="mt-1 text-xs font-medium text-white">{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={panelClass("border-dashed border-white/12")}>
          <CardContent className="px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/62">
              Step {step + 1} of {steps.length}: {steps[step]}
            </div>
          </CardContent>
        </Card>
        {stepMessage ? (
          <div className="rounded-[0.95rem] border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-50">
            {stepMessage}
          </div>
        ) : null}

        {step === 0 ? (
        <Card className={panelClass()}>
          <CardHeader>
            <CardTitle className="text-base text-white">Header</CardTitle>
            <CardDescription className="text-xs text-white/52">Only the fields from the official Case Opening & Amendment form.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2.5 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-white/72">Officer (Auto)</Label>
              <Input className={`${fieldClass()} h-9`} value={currentUser.name} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Officer Badge (Auto)</Label>
              <Input className={`${fieldClass()} h-9`} value={currentUser.badge || "N/A"} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Station Code</Label>
              <Input className={`${fieldClass()} h-9`} value={stnCode} readOnly={isCurrentStepLocked} onChange={(e)=>setStnCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Crime No</Label>
              <Input className={`${fieldClass()} h-9`} value={crimeNo} readOnly={isCurrentStepLocked} onChange={(e)=>setCrimeNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Year</Label>
              <Input className={`${fieldClass()} h-9`} value={crimeYear} onChange={(e)=>setCrimeYear(e.target.value)} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Region</Label>
              <Input className={`${fieldClass()} h-9`} value={crimeRegion} readOnly={isCurrentStepLocked} onChange={(e)=>setCrimeRegion(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Date Reported</Label>
              <Input className={`${fieldClass()} h-9`} type="date" value={dateReported} readOnly={isCurrentStepLocked} onChange={(e)=>setDateReported(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Time Reported</Label>
              <Input className={`${fieldClass()} h-9`} type="time" value={timeReported} readOnly={isCurrentStepLocked} onChange={(e)=>setTimeReported(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        ) : null}

        {step === 1 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">A. Method of Complaint</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-white/72">Method</Label>
              <Select value={methodOfComplaint} onValueChange={(v:any)=>{ if (!isCurrentStepLocked) setMethodOfComplaint(v) }}>
                <SelectTrigger className={fieldClass()}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovered_by_police">Discovered by Police</SelectItem>
                  <SelectItem value="reported_by_victim">Reported by Victim</SelectItem>
                  <SelectItem value="other_person">Other Person</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Reporting Person Full Name</Label>
              <Input className={fieldClass()} value={reportingPersonFullName} readOnly={isCurrentStepLocked} onChange={(e)=>setReportingPersonFullName(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-white/72">Reporting Address</Label>
              <Input className={fieldClass()} value={reportingAddress} readOnly={isCurrentStepLocked} onChange={(e)=>setReportingAddress(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-white/72">Statement by Person Reporting</Label>
              <Textarea className={fieldClass()} rows={3} value={complainantStatement} readOnly={isCurrentStepLocked} onChange={(e)=>setComplainantStatement(e.target.value)} placeholder="Full statement by person pressing charges..." />
            </div>
          </CardContent>
        </Card>
        ) : null}

        {step === 1 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">Complainant / Aggrieved Person</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-white/72">Full Name</Label>
              <Input className={fieldClass()} value={aggrievedFullName} readOnly={isCurrentStepLocked} onChange={(e)=>setAggrievedFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Address</Label>
              <Input className={fieldClass()} value={aggrievedAddress} readOnly={isCurrentStepLocked} onChange={(e)=>setAggrievedAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Sex</Label>
              <Input className={fieldClass()} value={sex} readOnly={isCurrentStepLocked} onChange={(e)=>setSex(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Age (Auto)</Label>
              <Input className={fieldClass()} value={age} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Date of Birth</Label>
              <Input
                className={fieldClass()}
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  if (isCurrentStepLocked) return
                  const dob = e.target.value
                  setDateOfBirth(dob)
                  setAge(calculateAgeFromDob(dob))
                }}
              />
            </div>
          </CardContent>
        </Card>
        ) : null}

        {step === 2 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">Incident</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-white/72">Alleged Crime</Label>
              <Input className={fieldClass()} value={allegedCrime} onChange={(e)=>setAllegedCrime(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-white/72">Attempt</Label>
              <Select value={attempt ? "yes" : "no"} onValueChange={(v)=>setAttempt(v==="yes")}>
                <SelectTrigger className={fieldClass()}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-white/72">Where Committed</Label>
              <Select value={whereCommitted} onValueChange={setWhereCommitted}>
                <SelectTrigger className={fieldClass()}><SelectValue placeholder="Select location type" /></SelectTrigger>
                <SelectContent>
                  {whereCommittedOptions.map(o => <SelectItem key={o} value={o}>{o.replaceAll("_"," ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {whereCommitted === "SPECIFY" && (
              <div className="space-y-1 md:col-span-2">
                <Label className="text-white/72">Specify</Label>
                <Input className={fieldClass()} value={whereCommittedSpecify} onChange={(e)=>setWhereCommittedSpecify(e.target.value)} />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-white/72">When From (Date)</Label>
              <Input className={fieldClass()} type="date" value={whenFromDate} onChange={(e)=>setWhenFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">When From (Time)</Label>
              <Input className={fieldClass()} type="time" value={whenFromTime} onChange={(e)=>setWhenFromTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">When To (Date)</Label>
              <Input className={fieldClass()} type="date" value={whenToDate} onChange={(e)=>setWhenToDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">When To (Time)</Label>
              <Input className={fieldClass()} type="time" value={whenToTime} onChange={(e)=>setWhenToTime(e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-white/72">Brief Details of Offence (Modus Operandi)</Label>
              <Textarea className={fieldClass()} value={modusOperandi} onChange={(e)=>setModusOperandi(e.target.value)} rows={4} />
            </div>

            <div className="space-y-1">
              <Label className="text-white/72">Property Type</Label>
              <Input className={fieldClass()} value={propertyType} onChange={(e)=>setPropertyType(e.target.value)} placeholder="Vehicle, phone, cash, injury..." />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Estimated Value</Label>
              <Input className={fieldClass()} value={propertyEstimatedValue} onChange={(e)=>setPropertyEstimatedValue(e.target.value)} placeholder="e.g. M 15,000" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Property Identifier</Label>
              <Input className={fieldClass()} value={propertyIdentifier} onChange={(e)=>setPropertyIdentifier(e.target.value)} placeholder="Serial, plate, IMEI..." />
            </div>
            <div className="space-y-1">
              <Label className="text-white/72">Property Description</Label>
              <Input className={fieldClass()} value={propertyDescription} onChange={(e)=>setPropertyDescription(e.target.value)} placeholder="Color, brand, condition..." />
            </div>

            {generatedPropertySummary ? (
              <div className="space-y-2 rounded-[0.95rem] border border-dashed border-cyan-400/25 bg-cyan-400/8 p-3 md:col-span-2">
                <div className="text-sm font-medium text-white">Generated Property Summary</div>
                <div className="text-sm text-white/62">{generatedPropertySummary}</div>
                <Button type="button" variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white" onClick={() => setPropertyOrInjury(generatedPropertySummary)}>
                  Use Generated Summary
                </Button>
              </div>
            ) : null}

            <div className="space-y-1 md:col-span-2">
              <Label className="text-white/72">Property / Vehicle Stolen OR Injury Sustained (Full description)</Label>
              <Textarea className={fieldClass()} value={propertyOrInjury} onChange={(e)=>setPropertyOrInjury(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
        ) : null}

        {step === 3 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">Flags & Injury / Weapons</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Drink Related</Label>
              <Select value={drinkRelated} onValueChange={(v:any)=>setDrinkRelated(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="offender">Offender drinking</SelectItem>
                  <SelectItem value="victim">Victim drinking</SelectItem>
                  <SelectItem value="both">Both drinking</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                  <SelectItem value="not_involved">Drink not involved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Drug Related</Label>
              <Select value={drugRelated} onValueChange={(v:any)=>setDrugRelated(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="offender">Offender under influence</SelectItem>
                  <SelectItem value="victim">Victim under influence</SelectItem>
                  <SelectItem value="both">Both under influence</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                  <SelectItem value="not_involved">Drugs not involved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Firearm Used</Label>
              <Select value={firearmUsed} onValueChange={(v:any)=>setFirearmUsed(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pistol_revolver">Pistol / Revolver</SelectItem>
                  <SelectItem value="rifle">Rifle</SelectItem>
                  <SelectItem value="shotgun">Shotgun</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Weapon Used</Label>
              <Select value={weaponUsed} onValueChange={(v:any)=>setWeaponUsed(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="knife">Knife</SelectItem>
                  <SelectItem value="stick">Stick</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                  <SelectItem value="scissors">Scissors</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Specify Firearm</Label>
              <Input value={firearmSpecify} onChange={(e)=>setFirearmSpecify(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Specify Weapon</Label>
              <Input value={weaponSpecify} onChange={(e)=>setWeaponSpecify(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Extent of Injury</Label>
              <Select value={extentOfInjury} onValueChange={(v:any)=>setExtentOfInjury(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slight">Slight cuts / bruising</SelectItem>
                  <SelectItem value="serious_hospital">Serious / detained in hospital</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Offender/Victim Relationship</Label>
              <Select value={offenderVictimRelationship} onValueChange={(v:any)=>setOffenderVictimRelationship(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="family_relative">Family relative</SelectItem>
                  <SelectItem value="married_spouse">Married/Spouse</SelectItem>
                  <SelectItem value="same_household">Same household</SelectItem>
                  <SelectItem value="neighbor">Neighbor</SelectItem>
                  <SelectItem value="employee_employer">Employee/Employer</SelectItem>
                  <SelectItem value="classmate">Classmate</SelectItem>
                  <SelectItem value="no_relationship">No relationship</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Victim Statement Taken</Label>
              <Select value={victimStatementTaken ? "yes" : "no"} onValueChange={(v)=>setVictimStatementTaken(v==="yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        ) : null}

        {step === 3 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">Suspect Details</CardTitle></CardHeader>
          <CardContent>
            <Textarea className={fieldClass()} value={suspectDetails} onChange={(e)=>setSuspectDetails(e.target.value)} rows={4} placeholder="Description / name / distinguishing features..." />
          </CardContent>
        </Card>
        ) : null}

        {step === 3 ? (
        <Card className={panelClass()}>
          <CardHeader><CardTitle className="text-white">Witness List</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              className={fieldClass()}
              value={witnessList}
              onChange={(e)=>setWitnessList(e.target.value)}
              rows={4}
              placeholder="List each witness: full name, contact, relation to incident..."
            />
          </CardContent>
        </Card>
        ) : null}

        {step === 3 ? (
        <Card className={panelClass("border-dashed border-white/12")}>
          <CardHeader>
            <CardTitle className="text-white">Property Seizure</CardTitle>
            <CardDescription className="text-white/52">After saving the case, open it and add seizure items under the "Property Seizure" tab.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white" onClick={saveDraft}>Save Draft First</Button>
          </CardContent>
        </Card>
        ) : null}

        <Card className={panelClass("border-dashed border-white/12")}>
          <CardContent className="flex flex-wrap items-center justify-end gap-2 p-3">
              <Button size="sm" variant="outline" className="h-9 border-white/12 bg-white/5 px-3 text-white hover:bg-white/10 hover:text-white" disabled={!canGoBack} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Back
              </Button>
              {!isLastStep ? (
              <Button size="sm" variant="outline" className="h-9 border-cyan-400/30 bg-cyan-400/10 px-3 text-cyan-100 hover:bg-cyan-400/18 hover:text-white" onClick={checkpointAndProceed}>
                Next
              </Button>
            ) : null}
            {isLastStep ? (
              <Button size="sm" className="h-9 bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] px-3 !text-white hover:opacity-95" onClick={submitNow} disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Sending..." : "Send Case"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PoliceOfficerShell>
  )
}

export default function PoliceNewCase() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PoliceNewCaseContent />
    </Suspense>
  )
}


