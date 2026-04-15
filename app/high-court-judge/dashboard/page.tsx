import { JudgeDashboardScreen } from "@/app/judge/dashboard/page"

export default function HighCourtJudgeDashboardPage() {
  return <JudgeDashboardScreen allowedRoles={["high_court_judge", "judge"]} title="High Court Judge Dashboard" scope="high" />
}
