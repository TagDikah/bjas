"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, Lock, CheckCircle, AlertCircle, Gavel } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useStore } from "@/lib/store"
import type { User } from "@/lib/blockchain"

type CourtRole = Extract<User["role"], "judge" | "court_registry" | "clerk">

export default function CourtStaffRegistration() {
  const router = useRouter()
  const store = useStore() as any
  const currentUser = store.currentUser
  const users = (store.users ?? store.getUsers?.() ?? []) as User[]
  const registerUser = store.registerUser ?? store.createUser ?? store.addUser;
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const judges = useMemo(
    () => users.filter((u: User) => u.role === "judge"),
    [users]
  )

  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string
    privateKey: string
  } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as CourtRole | "",
    employeeId: "",
    court: "High Court Maseru",
    chamber: "",
    specialization: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    nationalId: "",
    emergencyContact: "",
    assignedJudgeId: "",
    notes: "",
  })

  useEffect(() => {
    // clear errors when role changes
    setError("")
  }, [formData.role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setGeneratedKeys(null)

    if (!formData.role) {
      setError("Please select a role")
      return
    }

    if (formData.role === "clerk" && !formData.assignedJudgeId) {
      setError("Please assign a judge for the clerk")
      return
    }

    if (!formData.name.trim()) {
      setError("Full Name is required")
      return
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("A valid email address is required")
      return
    }

    setIsSubmitting(true)

    try {
      const created = registerUser(
        {
          role: formData.role,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          // map your form fields into supported User fields
          department: formData.role === "judge" ? "Judiciary" : "Court Administration",
          court: formData.court || undefined,
          badge: formData.employeeId || undefined,
          station: undefined,
          isActive: true,
        },
        currentUser?.id
      )

      // Your store returns full User with generated keys
      setGeneratedKeys({
        publicKey: created.publicKey,
        privateKey: created.privateKey,
      })
      setSuccess(true)

      // reset form
      setFormData({
        name: "",
        email: "",
        role: "" as CourtRole | "",
        employeeId: "",
        court: "High Court Maseru",
        chamber: "",
        specialization: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: "",
        nationalId: "",
        emergencyContact: "",
        assignedJudgeId: "",
        notes: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={["court_admin"]} title="Register Staff">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register Court Staff</h1>
          <p className="text-muted-foreground">
            Add new judges, registry staff, or clerks to the BEJAS system
          </p>
        </div>

        {success && generatedKeys && (
          <Alert className="border-primary bg-primary/10">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Registration Successful!</AlertTitle>
            <AlertDescription className="text-foreground">
              <p className="mb-3">
                The staff member has been registered. Please save the following keys securely:
              </p>

              <div className="flex flex-col gap-2 p-3 bg-secondary rounded-lg font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">Public Key:</span>
                  <p className="break-all">{generatedKeys.publicKey}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Private Key (KEEP SECRET):</span>
                  <p className="break-all text-destructive">{generatedKeys.privateKey}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Default demo password for newly registered users is <span className="font-medium">password123</span>.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Basic Information */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Scale className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>Personal details and account role</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@court.gov.ls"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as CourtRole })
                    }
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="judge">Judge</SelectItem>
                      <SelectItem value="court_registry">Court Registry</SelectItem>
                      <SelectItem value="clerk">Judge Clerk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="National ID number"
                    required
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Court Details */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Gavel className="h-5 w-5 text-primary" />
                  Court Details
                </CardTitle>
                <CardDescription>Employee ID, court, and assignment information</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., HC-2026-001"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="court">Court *</Label>
                  <Select
                    value={formData.court}
                    onValueChange={(value) => setFormData({ ...formData, court: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select court" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High Court Maseru">High Court Maseru</SelectItem>
                      <SelectItem value="High Court Berea">High Court Berea</SelectItem>
                      <SelectItem value="Court of Appeal">Court of Appeal</SelectItem>
                      <SelectItem value="Magistrate Court">Magistrate Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "judge" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="chamber">Chamber Number</Label>
                      <Input
                        id="chamber"
                        value={formData.chamber}
                        onChange={(e) => setFormData({ ...formData, chamber: e.target.value })}
                        placeholder="e.g., Chamber 5"
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({ ...formData, specialization: e.target.value })
                        }
                        placeholder="e.g., Criminal Law"
                        className="bg-input border-border"
                      />
                    </div>
                  </>
                )}

                {formData.role === "clerk" && (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label htmlFor="assignedJudge">Assigned Judge *</Label>
                    <Select
                      value={formData.assignedJudgeId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, assignedJudgeId: value })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select judge to assign clerk to" />
                      </SelectTrigger>

                      <SelectContent>
                        {judges.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No judges available - register a judge first
                          </SelectItem>
                        ) : (
                          judges.map((judge: User) => (
                            <SelectItem key={judge.id} value={judge.id}>
                              {judge.name} â€” {judge.court ?? "Court"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    <p className="text-xs text-muted-foreground">
                      Note: Clerk cases visibility depends on how you assign clerk IDs to cases.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>Address and emergency contact details</CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+266 XXXX XXXX"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContact: e.target.value })
                    }
                    placeholder="Name and phone number"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="address">Physical Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information..."
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/court-admin/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Staff Member"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}



