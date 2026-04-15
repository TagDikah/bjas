import { JudgeCaseWorkbench } from "@/components/judge-case-workbench"

export default async function HighCourtJudgeCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  return <JudgeCaseWorkbench caseId={caseId} allowedRoles={["high_court_judge", "judge"]} title="High Court Judge Workbench" />
}
