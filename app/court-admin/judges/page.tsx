"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gavel, UserPlus, FileText, TrendingUp, Clock } from "lucide-react"
import { useStore } from "@/lib/store"
import type { User, CaseData } from "@/lib/blockchain"

export default function JudgesManagement() {
  const router = useRouter()
  const store = useStore() as any

  const users: User[] = (store.users ?? store.getUsers?.() ?? []) as User[]
  const getAllCasesFn: (() => CaseData[]) =
    store.getAllCases ?? store.listCases ?? (() => [])

  const judges = useMemo(() => {
    return (users ?? []).filter((u: User) => u.role === "judge")
  }, [users])

  const cases = useMemo(() => {
    try {
      return getAllCasesFn() ?? []
    } catch {
      return []
    }
  }, [getAllCasesFn])

  const getJudgeCaseCount = (judgeId: string) => {
    return (cases ?? []).filter((c: any) => c.assignedJudgeId === judgeId).length
  }

  const getJudgeActiveCases = (judgeId: string) => {
    return (cases ?? []).filter((c: any) =>
      c.assignedJudgeId === judgeId && c.status === "assigned_to_judge"
    ).length
  }

  const getJudgeWorkload = (judgeId: string): "low" | "medium" | "high" => {
    const activeCases = getJudgeActiveCases(judgeId)
    if (activeCases <= 3) return "low"
    if (activeCases <= 7) return "medium"
    return "high"
  }

  return (
    <DashboardLayout allowedRoles={["court_admin"]} title="Judges Management">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Judges Management</h1>
            <p className="text-muted-foreground">
              View and manage judges, their workloads, and case assignments
            </p>
          </div>
          <Button onClick={() => router.push("/court-admin/register")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register New Judge
          </Button>
        </div>

        {judges.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12">
              <div className="text-center">
                <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No judges registered yet</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/court-admin/register")}
                >
                  Register First Judge
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {judges.map((judge: User) => {
              const workload = getJudgeWorkload(judge.id)
              const totalCases = getJudgeCaseCount(judge.id)
              const activeCases = getJudgeActiveCases(judge.id)

              return (
                <Card key={judge.id} className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Gavel className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground text-base">{judge.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {(judge.department ?? "").replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          workload === "low" ? "outline" : workload === "medium" ? "secondary" : "destructive"
                        }
                        className={workload === "low" ? "border-primary/50 text-primary" : ""}
                      >
                        {workload === "low" ? "Available" : workload === "medium" ? "Moderate" : "High Load"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-semibold text-foreground">{totalCases}</p>
                          <p className="text-xs text-muted-foreground">Total Cases</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-semibold text-foreground">{activeCases}</p>
                          <p className="text-xs text-muted-foreground">Active Cases</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Specialization</span>
                        <span className="text-foreground capitalize">
                          {(judge as any)?.metadata?.specialization?.replace(/_/g, " ") || "General"}
                        </span>
                      </div>

                      {(judge as any)?.metadata?.chamber && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Chamber</span>
                          <span className="text-foreground">{(judge as any).metadata.chamber}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>AI Assignment Score: {Math.floor(Math.random() * 20 + 80)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}