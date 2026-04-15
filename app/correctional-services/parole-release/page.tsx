"use client"

import { CorrectionalWorkflowWorkspace } from "@/components/correctional-workflow-workspace"

export default function ParoleReleasePage() {
  return (
    <CorrectionalWorkflowWorkspace
      title="Parole & Release Command"
      intro="Review parole eligibility, record parole decisions, execute release, and capture post-release monitoring in a single correctional workflow."
      initialTab="parole"
      allowedTabs={["parole", "release"]}
    />
  )
}
