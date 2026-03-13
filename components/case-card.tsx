"use client"

import { Calendar, MapPin, User, FileText, Scale } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CaseData } from "@/lib/blockchain"
import { cn } from "@/lib/utils"

interface CaseCardProps {
  caseData: CaseData
  onClick?: () => void
  showAssignment?: boolean
}

const statusConfig: Record<CaseData['status'], { label: string; className: string }> = {
  draft_police: { label: "Draft (Police)", className: "bg-muted text-muted-foreground border-muted" },
  submitted_to_prosecution_registry: { label: "Submitted → Prosecution Registry", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  registered_by_prosecution_registry: { label: "Registered", className: "bg-primary/20 text-primary border-primary/30" },
  submitted_to_dpp: { label: "Submitted → DPP", className: "bg-warning/20 text-warning-foreground border-warning/30" },
  dpp_review: { label: "DPP Review", className: "bg-warning/20 text-warning-foreground border-warning/30" },
  assigned_to_prosecutor: { label: "Assigned → Prosecutor", className: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  returned_to_police: { label: "Returned to Police", className: "bg-destructive/20 text-destructive border-destructive/30" },
  prosecutor_review: { label: "Prosecutor Review", className: "bg-chart-5/20 text-chart-5 border-chart-5/30" },
  filed_to_small_court: { label: "Filed → Small Court", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  small_court_registry_intake: { label: "Small Court Intake", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  assigned_to_small_court_judge: { label: "Assigned → Small Court Judge", className: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  small_court_in_progress: { label: "Small Court In Progress", className: "bg-chart-5/20 text-chart-5 border-chart-5/30" },
  small_court_completed: { label: "Small Court Completed", className: "bg-muted text-muted-foreground border-muted" },
  small_court_requests_high_court: { label: "Request High Court", className: "bg-warning/20 text-warning-foreground border-warning/30" },
  escalation_review: { label: "Escalation Review", className: "bg-warning/20 text-warning-foreground border-warning/30" },
  filed_to_high_court: { label: "Filed → High Court", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  high_court_registry_intake: { label: "High Court Intake", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  assigned_to_high_court_judge: { label: "Assigned → High Court Judge", className: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  high_court_in_progress: { label: "High Court In Progress", className: "bg-chart-5/20 text-chart-5 border-chart-5/30" },
  high_court_completed: { label: "High Court Completed", className: "bg-muted text-muted-foreground border-muted" },

  // Legacy
  pending_commissioner: { label: "Pending Review", className: "bg-warning/20 text-warning-foreground border-warning/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  rejected: { label: "Rejected", className: "bg-destructive/20 text-destructive border-destructive/30" },
  assigned_to_court: { label: "At Court Registry", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  assigned_to_judge: { label: "Assigned to Judge", className: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  in_progress: { label: "In Progress", className: "bg-chart-5/20 text-chart-5 border-chart-5/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-muted" },
}

export function CaseCard({ caseData, onClick, showAssignment = false }: CaseCardProps) {
  const status = statusConfig[caseData.status]

  return (
    <Card 
      className={cn(
        "border-border bg-card transition-all",
        onClick && "cursor-pointer hover:border-primary/50 hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">{caseData.caseNumber}</span>
              {caseData.citation && (
                <span className="font-mono text-xs text-muted-foreground">| {caseData.citation}</span>
              )}
            </div>
            <h3 className="font-semibold text-foreground leading-tight">{caseData.parties}</h3>
          </div>
          <Badge variant="outline" className={cn("shrink-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            <span>{caseData.charge}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{caseData.district}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(caseData.dateOpened).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>Filed by: {caseData.policeOfficerName}</span>
        </div>

        {showAssignment && caseData.court?.assignedJudgeName && (
          <div className="flex items-center gap-1.5 text-sm text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>Assigned to: {caseData.court.assignedJudgeName}</span>
          </div>
        )}

        {caseData.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{caseData.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
