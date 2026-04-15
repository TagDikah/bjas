"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import type { CaseData, User } from "@/lib/blockchain"
import type { PublicActivityType } from "@/lib/public-case-tracking"

export type WorkflowModuleField = {
  key: string
  label: string
  type?: "text" | "textarea" | "date" | "select"
  placeholder?: string
  rows?: number
  options?: { label: string; value: string }[]
}

type SubmitResult = {
  patch: Partial<CaseData>
  activityMessage: string
  activityMetadata?: Record<string, any>
  successMessage?: string
}

type WorkflowModuleFormProps = {
  title: string
  allowedRoles: string[]
  intro: string
  caseSelectorLabel: string
  casePlaceholder: string
  emptyMessage: string
  submitLabel: string
  successFallback: string
  fields: WorkflowModuleField[]
  activityType: PublicActivityType
  filterCases: (caseData: CaseData, currentUser: User | null) => boolean
  getInitialForm?: (selectedCase: CaseData) => Record<string, string>
  buildSubmitResult: (args: {
    selectedCase: CaseData
    currentUser: User
    form: Record<string, string>
  }) => SubmitResult
}

function text(value: unknown) {
  const normalized = String(value || "").trim()
  return normalized || "N/A"
}

function formatStatus(status: unknown) {
  const value = String(status || "").trim()
  if (!value) return "N/A"
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function WorkflowModuleForm({
  title,
  allowedRoles,
  intro,
  caseSelectorLabel,
  casePlaceholder,
  emptyMessage,
  submitLabel,
  successFallback,
  fields,
  activityType,
  filterCases,
  getInitialForm,
  buildSubmitResult,
}: WorkflowModuleFormProps) {
  const store = useStore() as any
  const currentUser = store.currentUser as User | null
  const getAllCases = store.getAllCases ?? (() => [])
  const updateCase = store.updateCase ?? (() => {})
  const appendCaseActivity = store.appendCaseActivity ?? (() => {})

  const queue = useMemo(
    () => (getAllCases() as CaseData[]).filter((item) => filterCases(item, currentUser)),
    [getAllCases, filterCases, currentUser]
  )

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [form, setForm] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const selectedCase = useMemo(
    () => queue.find((item) => item.caseId === selectedCaseId) || null,
    [queue, selectedCaseId]
  )

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onCaseChange(caseId: string) {
    setSelectedCaseId(caseId)
    const selected = queue.find((item) => item.caseId === caseId)
    setMessage("")
    setError("")
    setForm(selected ? getInitialForm?.(selected) ?? {} : {})
  }

  function submit() {
    setMessage("")
    setError("")

    if (!currentUser || !selectedCase) {
      setError("Select a case before submitting this form.")
      return
    }

    try {
      const result = buildSubmitResult({ selectedCase, currentUser, form })
      updateCase(selectedCase.caseId, result.patch)
      appendCaseActivity({
        caseId: selectedCase.caseId,
        type: activityType,
        actorName: currentUser.name || currentUser.fullName || "Workflow User",
        actorRole: "internal",
        message: result.activityMessage,
        metadata: result.activityMetadata,
      })
      setMessage(result.successMessage || successFallback)
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to save this form.")
    }
  }

  return (
    <DashboardLayout allowedRoles={allowedRoles} title={title}>
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{intro}</p>
            <div className="space-y-2">
              <Label>{caseSelectorLabel}</Label>
              <Select value={selectedCaseId} onValueChange={onCaseChange}>
                <SelectTrigger>
                  <SelectValue placeholder={casePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {queue.map((item) => (
                    <SelectItem key={item.caseId} value={item.caseId}>
                      {text(item.caseNumber)} | {text(item.charge)} | {formatStatus(item.status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {message ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {selectedCase ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Selected Case</span>
                  <Badge variant="secondary">{formatStatus(selectedCase.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Case Number:</span> {text(selectedCase.caseNumber)}</div>
                <div><span className="text-muted-foreground">Case ID:</span> {text(selectedCase.caseId)}</div>
                <div><span className="text-muted-foreground">Charge:</span> {text(selectedCase.charge)}</div>
                <div><span className="text-muted-foreground">District:</span> {text(selectedCase.district)}</div>
                <div><span className="text-muted-foreground">Parties:</span> {text(selectedCase.parties)}</div>
                <div><span className="text-muted-foreground">Current Status:</span> {formatStatus(selectedCase.status)}</div>
                <div className="md:col-span-2"><span className="text-muted-foreground">Description:</span> {text(selectedCase.description)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  const value = form[field.key] || ""
                  const type = field.type || "text"

                  if (type === "textarea") {
                    return (
                      <div key={field.key} className="space-y-2 md:col-span-2">
                        <Label>{field.label}</Label>
                        <Textarea
                          rows={field.rows || 4}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(e) => setField(field.key, e.target.value)}
                        />
                      </div>
                    )
                  }

                  if (type === "select") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>
                        <Select value={value} onValueChange={(next) => setField(field.key, next)}>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map((option) => (
                              <SelectItem key={`${field.key}-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  return (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        type={type}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="text-white" onClick={submit}>
                {submitLabel}
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {queue.length === 0 ? emptyMessage : casePlaceholder}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
