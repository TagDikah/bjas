"use client"

import { WorkflowModuleForm } from "@/components/workflow-module-form"

export default function AppealTrackingPage() {
  return (
    <WorkflowModuleForm
      title="Appeal Tracking"
      allowedRoles={["appeal_registry", "appeal_judge"]}
      intro="Record appeal filing, hearing progression, and final appellate outcome for cases that move into the appeal stage."
      caseSelectorLabel="Appeal Case"
      casePlaceholder="Select case for appeal tracking"
      emptyMessage="No appealed cases are available for appeal tracking right now."
      submitLabel="Save Appeal Update"
      successFallback="Appeal tracking record saved."
      activityType="appeal_decided"
      filterCases={(caseData) => ["appealed", "appeal_in_progress", "appeal_decided"].includes(String(caseData.status || "").toLowerCase())}
      getInitialForm={(selectedCase) => ({
        appealStatus: String(selectedCase?.appealTracking?.latestEntry?.appealStatus || "appeal_in_progress"),
        appealDate: String(selectedCase?.appealTracking?.latestEntry?.appealDate || new Date().toISOString().slice(0, 10)),
        appealCourt: String(selectedCase?.appealTracking?.latestEntry?.appealCourt || ""),
        appealGrounds: String(selectedCase?.appealTracking?.latestEntry?.appealGrounds || ""),
        appealOutcomeNotes: String(selectedCase?.appealTracking?.latestEntry?.appealOutcomeNotes || ""),
      })}
      fields={[
        {
          key: "appealStatus",
          label: "Appeal Status",
          type: "select",
          options: [
            { label: "Appeal In Progress", value: "appeal_in_progress" },
            { label: "Appeal Decided", value: "appeal_decided" },
          ],
        },
        { key: "appealDate", label: "Appeal Date", type: "date" },
        { key: "appealCourt", label: "Appeal Court", placeholder: "High Court / Appeal Court / Panel" },
        { key: "appealGrounds", label: "Appeal Grounds", type: "textarea", rows: 3, placeholder: "Enter grounds of appeal or issues raised" },
        { key: "appealOutcomeNotes", label: "Appeal Outcome Notes", type: "textarea", rows: 5, placeholder: "Enter hearing notes, appellate outcome, or sentence modification details" },
      ]}
      buildSubmitResult={({ selectedCase, currentUser, form }) => {
        const latestEntry = {
          ...form,
          submittedAt: new Date().toISOString(),
          submittedById: currentUser.id,
          submittedByName: currentUser.name || currentUser.fullName || "Appeal Registry Officer",
        }

        return {
          patch: {
            status: form.appealStatus,
            appealTracking: {
              entries: [latestEntry, ...(selectedCase.appealTracking?.entries || [])],
              latestEntry,
            },
          },
          activityMessage: form.appealStatus === "appeal_decided"
            ? `Appeal outcome recorded for ${selectedCase.caseNumber || selectedCase.caseId}.`
            : `Appeal tracking updated for ${selectedCase.caseNumber || selectedCase.caseId}.`,
          activityMetadata: { module: "appeal_tracking", appealStatus: form.appealStatus },
        }
      }}
    />
  )
}
