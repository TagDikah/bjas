"use client"

import { WorkflowModuleForm } from "@/components/workflow-module-form"

export default function SentencingPage() {
  return (
    <WorkflowModuleForm
      title="Sentencing"
      allowedRoles={["high_court_judge", "judge", "small_court_judge"]}
      intro="Capture the sentencing outcome after judgment, including prison term, fine, suspended term, probation, or community service."
      caseSelectorLabel="Case for Sentencing"
      casePlaceholder="Select case ready for sentence"
      emptyMessage="No judicial cases are currently ready for sentencing updates."
      submitLabel="Save Sentencing Form"
      successFallback="Sentencing form saved."
      activityType="sentence_imposed"
      filterCases={(caseData, currentUser) => {
        const status = String(caseData.status || "").toLowerCase()
        const assignedJudgeId = String(caseData?.court?.assignedJudgeId || "")
        const currentId = String(currentUser?.id || "")
        return ["judgment_delivered", "trial_in_progress", "first_appearance", "assigned_to_high_court_judge", "assigned_to_small_court_judge"].includes(status) && (!assignedJudgeId || assignedJudgeId === currentId)
      }}
      getInitialForm={(selectedCase) => ({
        sentenceType: String(selectedCase?.sentencingRecord?.latestEntry?.sentenceType || ""),
        sentenceLength: String(selectedCase?.sentencingRecord?.latestEntry?.sentenceLength || ""),
        fineAmount: String(selectedCase?.sentencingRecord?.latestEntry?.fineAmount || ""),
        probationTerms: String(selectedCase?.sentencingRecord?.latestEntry?.probationTerms || ""),
        sentenceNotes: String(selectedCase?.sentencingRecord?.latestEntry?.sentenceNotes || ""),
      })}
      fields={[
        {
          key: "sentenceType",
          label: "Sentence Type",
          type: "select",
          options: [
            { label: "Prison Term", value: "prison_term" },
            { label: "Fine", value: "fine" },
            { label: "Suspended Sentence", value: "suspended_sentence" },
            { label: "Community Service", value: "community_service" },
            { label: "Probation", value: "probation" },
          ],
        },
        { key: "sentenceLength", label: "Sentence Length / Duration", placeholder: "Example: 5 years or 120 hours" },
        { key: "fineAmount", label: "Fine Amount", placeholder: "Enter amount if applicable" },
        { key: "probationTerms", label: "Probation / Conditions", type: "textarea", rows: 3, placeholder: "Enter probation terms or special conditions" },
        { key: "sentenceNotes", label: "Sentencing Notes", type: "textarea", rows: 5, placeholder: "Enter sentencing reasoning and final directives" },
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
            status: "sentenced",
            sentencingRecord: {
              entries: [latestEntry, ...(selectedCase.sentencingRecord?.entries || [])],
              latestEntry,
            },
          },
          activityMessage: `Sentence imposed for ${selectedCase.caseNumber || selectedCase.caseId}.`,
          activityMetadata: { module: "sentencing", sentenceType: form.sentenceType },
        }
      }}
    />
  )
}
