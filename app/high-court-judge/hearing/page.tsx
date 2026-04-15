"use client"

import { WorkflowModuleForm } from "@/components/workflow-module-form"

export default function JudgeCaseHearingPage() {
  return (
    <WorkflowModuleForm
      title="Judge Case Hearing"
      allowedRoles={["high_court_judge", "judge", "small_court_judge"]}
      intro="Record first appearance, plea, bail, and hearing directions for the selected judicial file."
      caseSelectorLabel="Judicial Case"
      casePlaceholder="Select case assigned for hearing"
      emptyMessage="No judge-assigned cases are available for hearing updates right now."
      submitLabel="Save Hearing Record"
      successFallback="Hearing record saved."
      activityType="first_appearance_recorded"
      filterCases={(caseData, currentUser) => {
        const status = String(caseData.status || "").toLowerCase()
        const assignedJudgeId = String(caseData?.court?.assignedJudgeId || "")
        const currentId = String(currentUser?.id || "")
        return ["assigned_to_high_court_judge", "assigned_to_small_court_judge", "high_court_in_progress", "in_progress"].includes(status) && (!assignedJudgeId || assignedJudgeId === currentId)
      }}
      getInitialForm={(selectedCase) => ({
        appearanceDate: String(selectedCase?.hearingRecord?.latestEntry?.appearanceDate || new Date().toISOString().slice(0, 10)),
        plea: String(selectedCase?.hearingRecord?.latestEntry?.plea || ""),
        accusedPresence: String(selectedCase?.hearingRecord?.latestEntry?.accusedPresence || "present"),
        representationStatus: String(selectedCase?.hearingRecord?.latestEntry?.representationStatus || ""),
        bailDecision: String(selectedCase?.hearingRecord?.latestEntry?.bailDecision || ""),
        hearingNotes: String(selectedCase?.hearingRecord?.latestEntry?.hearingNotes || ""),
      })}
      fields={[
        { key: "appearanceDate", label: "Appearance Date", type: "date" },
        {
          key: "plea",
          label: "Plea",
          type: "select",
          options: [
            { label: "Not Yet Entered", value: "not_entered" },
            { label: "Guilty", value: "guilty" },
            { label: "Not Guilty", value: "not_guilty" },
          ],
        },
        {
          key: "accusedPresence",
          label: "Accused Presence",
          type: "select",
          options: [
            { label: "Present", value: "present" },
            { label: "Absent", value: "absent" },
          ],
        },
        { key: "representationStatus", label: "Representation Status", placeholder: "Counsel present / self represented / legal aid" },
        {
          key: "bailDecision",
          label: "Bail Decision",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Granted", value: "granted" },
            { label: "Denied", value: "denied" },
          ],
        },
        { key: "hearingNotes", label: "Hearing Notes", type: "textarea", rows: 5, placeholder: "Record hearing directions, adjournments, testimony notes, or interim orders" },
      ]}
      buildSubmitResult={({ selectedCase, currentUser, form }) => {
        const latestEntry = {
          ...form,
          submittedAt: new Date().toISOString(),
          submittedById: currentUser.id,
          submittedByName: currentUser.name || currentUser.fullName || "Judge",
        }

        return {
          patch: {
            status: "first_appearance",
            hearingRecord: {
              entries: [latestEntry, ...(selectedCase.hearingRecord?.entries || [])],
              latestEntry,
            },
          },
          activityMessage: `First appearance and hearing notes recorded for ${selectedCase.caseNumber || selectedCase.caseId}.`,
          activityMetadata: { module: "judge_case_hearing", plea: form.plea, bailDecision: form.bailDecision },
        }
      }}
    />
  )
}
