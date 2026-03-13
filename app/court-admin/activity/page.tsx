"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { Clock, Scale, Gavel, CheckCircle, Send, UserPlus } from "lucide-react"

type BlockchainBlock = {
  index: number
  timestamp: string | number | Date
  hash: string
  data: {
    action?: string
    details?: string
    userId?: string
    caseId?: string
  }
}

const COURT_ACTIONS = new Set([
  "case_sent_to_registry",
  "case_assigned",
  "case_hearing_scheduled",
  "case_status_updated",
  "user_registered",
])

export default function CourtActivityLog() {
  const blockchain = useStore((s: any) => s.blockchain) as any
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([])

  const chain: BlockchainBlock[] = useMemo(() => {
    const b: any = blockchain
    const raw =
      b?.chain ??
      b?.blocks ??
      b?.getChain?.() ??
      b?.getBlockchain?.() ??
      b?.getBlockchain?.()?.chain ??
      []

    return Array.isArray(raw) ? (raw as BlockchainBlock[]) : []
  }, [blockchain])

  useEffect(() => {
    const courtBlocks = chain.filter((block: BlockchainBlock) => {
      const action = block?.data?.action
      return typeof action === "string" && COURT_ACTIONS.has(action)
    })
    setBlocks([...courtBlocks].reverse())
  }, [chain])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "case_sent_to_registry":
        return <Send className="h-4 w-4 text-blue-500" />
      case "case_assigned":
        return <Gavel className="h-4 w-4 text-primary" />
      case "case_hearing_scheduled":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "case_status_updated":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "user_registered":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      default:
        return <Scale className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "case_sent_to_registry":
        return "Case Received"
      case "case_assigned":
        return "Case Assigned"
      case "case_hearing_scheduled":
        return "Hearing Scheduled"
      case "case_status_updated":
        return "Status Updated"
      case "user_registered":
        return "Staff Registered"
      default:
        return action
    }
  }

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "case_assigned":
        return "default"
      case "case_hearing_scheduled":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <DashboardLayout allowedRoles={["court_admin"]} title="Activity Log">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Court Activity Log</h1>
          <p className="text-muted-foreground">All court activities recorded on the blockchain</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activities</CardTitle>
          </CardHeader>

          <CardContent>
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No court activities recorded yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {blocks.map((block: BlockchainBlock) => {
                  const action = block.data.action ?? "unknown_action"

                  return (
                    <div
                      key={block.hash}
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                        {getActionIcon(action)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionVariant(action)}>{getActionLabel(action)}</Badge>
                          <span className="text-xs text-muted-foreground">Block #{block.index}</span>
                        </div>

                        <p className="text-sm text-foreground mb-2">
                          {block.data.details || "No details available"}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(block.timestamp).toLocaleString()}
                          </span>

                          {block.data.userId && <span>User: {block.data.userId.slice(0, 8)}...</span>}
                          {block.data.caseId && <span>Case: {block.data.caseId.slice(0, 8)}...</span>}
                        </div>

                        <div className="mt-2 p-2 bg-card rounded border border-border">
                          <p className="text-xs text-muted-foreground">Hash</p>
                          <p className="font-mono text-xs text-foreground break-all">{block.hash}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}