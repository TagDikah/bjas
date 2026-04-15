"use client"

import { CorrectionalWorkflowWorkspace } from "@/components/correctional-workflow-workspace"

export default function CorrectionalIntakePage() {
  return (
    <CorrectionalWorkflowWorkspace
      title="Correctional Intake Command"
      intro="Handle inmate admission, classification, medical examination, property intake, biometrics, and sentence setup in one correctional workspace."
      initialTab="admission"
      allowedTabs={["admission"]}
    />
  )
}
