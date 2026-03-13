"use client"

import { useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, FileText, CheckCircle, XCircle, Send } from "lucide-react"
import { useStore } from "@/lib/store"

type ActivityBlock = {
  index: number
  timestamp: string
  hash: string
  data: {
    action: "case_created" | "case_approved" | "case_rejected" | "user_registered" | string
    details?: string
    userId?: string
    caseId?: string
  }
}

function getChainSafe(blockchain: any): ActivityBlock[] {
  if (!blockchain) return []

  // Most common patterns
  if (typeof blockchain.getChain === "function") {
    const chain = blockchain.getChain()
    return Array.isArray(chain) ? (chain as ActivityBlock[]) : []
  }

  if (Array.isArray(blockchain.chain)) return blockchain.chain as ActivityBlock[]
  if (Array.isArray(blockchain.blocks)) return blockchain.blocks as ActivityBlock[]

  return []
}

export default function PoliceActivityLog() {
  const { initBlockchain, blockchain } = useStore()

  // Ensure blockchain instance exists
  useEffect(() => {
    initBlockchain()
  }, [initBlockchain])

  const blocks = useMemo(() => {
    const chain = getChainSafe(blockchain)

    // Filter police-related blocks
    const policeBlocks = chain.filter((block: ActivityBlock) => {
      const action = block?.data?.action
      return (
        action === "case_created" ||
        action === "case_approved" ||
        action === "case_rejected" ||
        action === "user_registered"
      )
    })

    return [...policeBlocks].reverse()
  }, [blockchain])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "case_created":
        return <FileText className="h-4 w-4 text-primary" />
      case "case_approved":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "case_rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "user_registered":
        return <Shield className="h-4 w-4 text-primary" />
      default:
        return <Send className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "case_created":
        return "Case Created"
      case "case_approved":
        return "Case Approved"
      case "case_rejected":
        return "Case Rejected"
      case "user_registered":
        return "User Registered"
      default:
        return action
    }
  }

  const getActionVariant = (
    action: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "case_approved":
        return "default"
      case "case_rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <DashboardLayout allowedRoles={["police_admin"]} title="Activity Log">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blockchain Activity Log</h1>
          <p className="text-muted-foreground">
            All police department activities recorded on the blockchain
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activities</CardTitle>
          </CardHeader>

          <CardContent>
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activities recorded yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {blocks.map((block: ActivityBlock) => (
                  <div
                    key={block.hash}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                      {getActionIcon(block.data.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getActionVariant(block.data.action)}>
                          {getActionLabel(block.data.action)}
                        </Badge>
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

                        {block.data.userId && (
                          <span>User: {block.data.userId.slice(0, 8)}...</span>
                        )}

                        {block.data.caseId && (
                          <span>Case: {block.data.caseId.slice(0, 8)}...</span>
                        )}
                      </div>

                      <div className="mt-2 p-2 bg-card rounded border border-border">
                        <p className="text-xs text-muted-foreground">Hash</p>
                        <p className="font-mono text-xs text-foreground break-all">{block.hash}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
