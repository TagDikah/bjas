"use client"

import { CorrectionalWorkflowWorkspace } from "@/components/correctional-workflow-workspace"

export default function SentenceManagementPage() {
  return (
    <CorrectionalWorkflowWorkspace
      title="Sentence Management Command"
      intro="Manage sentence execution, daily behavior, rehabilitation, visits, and prison incidents in a dedicated correctional interface."
      initialTab="sentence"
      allowedTabs={["sentence"]}
    />
  )
}
