import { JudgeCaseWorkbench } from "@/components/judge-case-workbench"

export default async function SmallCourtJudgeCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  return <JudgeCaseWorkbench caseId={caseId} allowedRoles={["small_court_judge"]} title="Small Court Judge Workbench" />
}
