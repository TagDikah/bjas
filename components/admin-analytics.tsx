"use client"

import { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  title: string
  roleCounts: Record<string, number>
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
}

const COLORS = ["#2b6cb0", "#3b82c4", "#5aa2d6", "#8bb9dd", "#d6a64a", "#3b8f6b", "#d95f5f"]

function prettyRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase())
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  POLICE_ADMIN: "Police Admin",
  POLICE_COMMISSIONER: "Commissioner",
  POLICE_INVESTIGATOR: "Investigation",
  POLICE_REGISTRY: "Police Registry",
  DPP_ADMIN: "DPP Admin",
  DPP_PROSECUTOR: "Prosecutor",
  PROSECUTION_REGISTRY: "Prosecution Registry",
  COURT_ADMIN: "Court Admin",
  HIGH_COURT_REGISTRY_ASSISTANT: "HC Registry Assist",
  HIGH_COURT_REGISTRY: "HC Registry",
  JUDGE: "Judge",
  JUDGE_CLERK: "Clerk",
  MAGISTRATE: "Magistrate",
  MAG_ASSIST_REGISTRY: "SC Registry Assist",
  MAG_REGISTRY: "SC Registry",
  CORRECTIONAL_ADMIN: "Correctional Admin",
  CORRECTIONAL_SERVICES: "Correctional Services",
  APPEAL_REGISTRY: "Appeal Registry",
  APPEAL_JUDGE: "Appeal Judge",
  ARCHIVE_OFFICER: "Archive Officer",
}

function shortRoleLabel(role: string) {
  return ROLE_LABELS[role] ?? prettyRole(role)
}

export function AdminAnalytics({ title, roleCounts, totalUsers, activeUsers, inactiveUsers }: Props) {
  const roleData = Object.entries(roleCounts)
    .map(([role, value]) => ({
      role: prettyRole(role),
      shortRole: shortRoleLabel(role),
      value,
    }))
    .sort((a, b) => b.value - a.value || a.shortRole.localeCompare(b.shortRole))

  const statusData = [
    { name: "Active", value: activeUsers },
    { name: "Inactive", value: inactiveUsers },
  ]

  const recommendation =
    inactiveUsers > 0
      ? "Some accounts are inactive. Review dormant users and reactivate only the teams that still need access."
      : roleData.length > 0
        ? `The largest user group is ${roleData[0]?.role || "Unknown"}. Prioritize training, approvals, and staffing around that office first.`
        : "No user analytics are available yet."

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div
            className="min-h-[320px]"
            style={{ height: `${Math.max(320, roleData.length * 42)}` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} layout="vertical" margin={{ top: 6, right: 28, bottom: 6, left: 6 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="shortRole"
                  width={132}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <Tooltip formatter={(value) => [value, "Users"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.role ?? ""} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#3b82c4">
                  <LabelList dataKey="value" position="right" className="fill-foreground text-[11px]" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={4}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>Total users: <span className="font-semibold text-foreground">{totalUsers}</span></div>
          <div>Active users: <span className="font-semibold text-foreground">{activeUsers}</span></div>
          <div>Inactive users: <span className="font-semibold text-foreground">{inactiveUsers}</span></div>
          <p className="leading-6">{recommendation}</p>
        </CardContent>
      </Card>
    </div>
  )
}
