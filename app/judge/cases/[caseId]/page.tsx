import { JudgeCaseWorkbench } from "@/components/judge-case-workbench"

export default async function JudgeCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  return <JudgeCaseWorkbench caseId={caseId} allowedRoles={["judge", "high_court_judge"]} title="Judge Case Workbench" />
}
