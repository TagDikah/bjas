"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore } from "@/lib/store"

const POLICE_ROLE_OPTIONS = [
  { value: "police_admin", label: "Police Admin", accessLevel: "Full Access" },
  { value: "police_officer", label: "Police Officer", accessLevel: "Limited Access" },
  { value: "investigation", label: "Police Investigator", accessLevel: "Limited Access" },
  { value: "police", label: "Police Registry", accessLevel: "Limited Access" },
  { value: "commissioner", label: "Commissioner", accessLevel: "Full Access" },
] as const

const POLICE_RANKS = [
  "Constable",
  "Corporal",
  "Sergeant",
  "Sub Inspector",
  "Inspector",
  "Superintendent",
  "Senior Superintendent",
  "Assistant Commissioner",
  "Commissioner",
] as const

const GENDERS = ["Male", "Female", "Other"] as const
const EMPLOYMENT_STATUSES = ["Active", "Suspended", "Retired"] as const
const POLICE_DEPARTMENTS = [
  "Lesotho Mounted Police Headquarters (PHQ)",
  "CID",
  "Traffic Department",
  "Special Operations",
] as const
const POLICE_STATIONS = [
  "Maseru Central Police Station",
  "Mafeteng Police Station",
  "Leribe Police Station",
  "Berea Police Station",
] as const
const POLICE_REGIONS = ["Maseru", "Leribe", "Berea", "Mafeteng"] as const
const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite childhood place?",
  "What was your first service posting?",
] as const
const PERMISSION_OPTIONS = [
  { key: "createCases", label: "Create Cases" },
  { key: "editCases", label: "Edit Cases" },
  { key: "viewCases", label: "View Cases" },
  { key: "assignCases", label: "Assign Cases" },
  { key: "approveCases", label: "Approve Cases" },
  { key: "uploadEvidence", label: "Upload Evidence" },
  { key: "viewReports", label: "View Reports" },
] as const
const STEPS = [
  { id: 1, title: "Account Information" },
  { id: 2, title: "Personal Details" },
  { id: 3, title: "Professional Details" },
  { id: 4, title: "Station & Department" },
  { id: 5, title: "Role Permissions" },
  { id: 6, title: "Security Details" },
  { id: 7, title: "System Metadata" },
  { id: 8, title: "Review & Submit" },
] as const

type PermissionKey = (typeof PERMISSION_OPTIONS)[number]["key"]

const DEFAULT_PERMISSIONS: Record<string, Record<PermissionKey, boolean>> = {
  police_admin: {
    createCases: true,
    editCases: true,
    viewCases: true,
    assignCases: true,
    approveCases: true,
    uploadEvidence: true,
    viewReports: true,
  },
  commissioner: {
    createCases: false,
    editCases: true,
    viewCases: true,
    assignCases: true,
    approveCases: true,
    uploadEvidence: false,
    viewReports: true,
  },
  investigation: {
    createCases: true,
    editCases: true,
    viewCases: true,
    assignCases: true,
    approveCases: false,
    uploadEvidence: true,
    viewReports: true,
  },
  police: {
    createCases: true,
    editCases: false,
    viewCases: true,
    assignCases: false,
    approveCases: false,
    uploadEvidence: false,
    viewReports: true,
  },
  police_officer: {
    createCases: true,
    editCases: true,
    viewCases: true,
    assignCases: false,
    approveCases: false,
    uploadEvidence: true,
    viewReports: false,
  },
}

function getRoleConfig(role: string) {
  return POLICE_ROLE_OPTIONS.find((item) => item.value === role) ?? POLICE_ROLE_OPTIONS[0]
}

function buildDefaultForm(currentUser: any) {
  const role = "police_admin"
  return {
    email: "",
    password: "password123",
    confirmPassword: "password123",
    role,
    fullname: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    phoneNumber: "",
    residentialAddress: "",
    rank: "Constable",
    badge: "",
    yearsOfService: "",
    employmentStatus: "Active",
    department: "Lesotho Mounted Police Headquarters (PHQ)",
    station: "Maseru Central Police Station",
    region: "Maseru",
    accessLevel: getRoleConfig(role).accessLevel,
    permissions: { ...DEFAULT_PERMISSIONS[role] },
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: "",
    twoFactorEnabled: true,
    createdBy: currentUser?.id || "Current Admin Session",
    dateCreated: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    blockchainAnchorStatus: "Pending",
  }
}

export default function PoliceAdminRegisterPage() {
  const router = useRouter()
  const currentUser = useStore((state: any) => state.currentUser)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [keys, setKeys] = useState<{ publicKey?: string; privateKey?: string } | null>(null)
  const [form, setForm] = useState(() => buildDefaultForm(null))

  const roleConfig = useMemo(() => getRoleConfig(form.role), [form.role])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      createdBy: currentUser?.id || "Current Admin Session",
    }))
  }, [currentUser?.id])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      accessLevel: roleConfig.accessLevel,
      permissions: { ...DEFAULT_PERMISSIONS[form.role] },
      rank: form.role === "commissioner" ? "Commissioner" : current.rank,
      lastUpdated: new Date().toISOString(),
    }))
  }, [form.role, roleConfig.accessLevel])

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      lastUpdated: new Date().toISOString(),
    }))
  }

  function updatePermission(key: PermissionKey, checked: boolean) {
    setForm((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [key]: checked,
      },
      lastUpdated: new Date().toISOString(),
    }))
  }

  function validateStep(stepToValidate = step) {
    if (stepToValidate === 1) {
      if (!form.email.trim() || !form.password.trim() || !form.confirmPassword.trim() || !form.role.trim()) {
        setError("Complete the account information before moving on.")
        return false
      }
      if (form.password !== form.confirmPassword) {
        setError("Password and confirm password must match.")
        return false
      }
    }

    if (stepToValidate === 2) {
      if (!form.fullname.trim() || !form.dateOfBirth || !form.nationalId.trim() || !form.phoneNumber.trim() || !form.residentialAddress.trim()) {
        setError("Complete the personal details before moving on.")
        return false
      }
    }

    if (stepToValidate === 3) {
      if (!form.rank.trim() || !form.badge.trim() || !form.yearsOfService.trim() || !form.employmentStatus.trim()) {
        setError("Complete the professional details before moving on.")
        return false
      }
    }

    if (stepToValidate === 4) {
      if (!form.department.trim() || !form.station.trim() || !form.region.trim()) {
        setError("Complete the station and department details before moving on.")
        return false
      }
    }

    if (stepToValidate === 6) {
      if (!form.securityQuestion.trim() || !form.securityAnswer.trim()) {
        setError("Complete the security details before moving on.")
        return false
      }
    }

    setError("")
    return true
  }

  function goToStep(nextStep: number) {
    if (nextStep > step && !validateStep(step)) return
    setStep(nextStep)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    for (const requiredStep of [1, 2, 3, 4, 6]) {
      if (!validateStep(requiredStep)) {
        setStep(requiredStep)
        return
      }
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setKeys(null)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullname: form.fullname,
          name: form.fullname,
          password: form.password,
          role: form.role,
          badge: form.badge,
          department: form.department,
          station: form.station,
          metadata: {
            office: "Police",
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            nationalId: form.nationalId,
            phoneNumber: form.phoneNumber,
            residentialAddress: form.residentialAddress,
            rank: form.rank,
            yearsOfService: form.yearsOfService,
            employmentStatus: form.employmentStatus,
            region: form.region,
            accessLevel: form.accessLevel,
            permissions: form.permissions,
            securityQuestion: form.securityQuestion,
            securityAnswer: form.securityAnswer,
            twoFactorEnabled: form.twoFactorEnabled,
            createdBy: form.createdBy,
            dateCreated: form.dateCreated,
            lastUpdated: form.lastUpdated,
            blockchainAnchorStatus: form.blockchainAnchorStatus,
          },
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data?.error || "Unable to create user.")
        return
      }

      setSuccess(`User created successfully. Password: ${data.temporaryPassword}`)
      setKeys(data?.user ? { publicKey: data.user.publicKey, privateKey: data.user.privateKey } : null)
      setStep(1)
      setForm(buildDefaultForm(currentUser))
    } catch {
      setError("Network error while creating the user.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={["police_admin", "admin"]} title="Register Police User">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Police User Registration</CardTitle>
            <CardDescription>
              Register police staff with account, identity, professional, station, security, and permission details in one controlled workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              {STEPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToStep(item.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    step === item.id
                      ? "border-primary bg-primary/8 text-primary shadow-sm"
                      : "border-border/80 bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        step === item.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className="min-w-0 text-xs font-semibold leading-4 sm:text-[13px]">
                      {item.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {step === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="charlesnkhabe18@gmail.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(value) => updateForm("role", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POLICE_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="text" minLength={8} value={form.password} onChange={(e) => updateForm("password", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="text" minLength={8} value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} required />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.fullname} onChange={(e) => updateForm("fullname", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(value) => updateForm("gender", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => updateForm("dateOfBirth", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>National ID / Passport Number</Label>
                  <Input value={form.nationalId} onChange={(e) => updateForm("nationalId", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={form.phoneNumber} onChange={(e) => updateForm("phoneNumber", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Residential Address</Label>
                  <Input value={form.residentialAddress} onChange={(e) => updateForm("residentialAddress", e.target.value)} required />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rank</Label>
                  <Select value={form.rank} onValueChange={(value) => updateForm("rank", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POLICE_RANKS.map((rank) => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Badge Number</Label>
                  <Input value={form.badge} onChange={(e) => updateForm("badge", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Years of Service</Label>
                  <Input type="number" min="0" value={form.yearsOfService} onChange={(e) => updateForm("yearsOfService", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={form.employmentStatus} onValueChange={(value) => updateForm("employmentStatus", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(value) => updateForm("department", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POLICE_DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>{department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Station</Label>
                  <Select value={form.station} onValueChange={(value) => updateForm("station", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POLICE_STATIONS.map((station) => (
                        <SelectItem key={station} value={station}>{station}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={form.region} onValueChange={(value) => updateForm("region", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POLICE_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Input value={form.accessLevel} readOnly className="bg-muted/50" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PERMISSION_OPTIONS.map((permission) => (
                    <label key={permission.key} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                      <Checkbox
                        checked={form.permissions[permission.key]}
                        onCheckedChange={(checked) => updatePermission(permission.key, checked === true)}
                      />
                      <span className="text-sm font-medium">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Security Question</Label>
                  <Select value={form.securityQuestion} onValueChange={(value) => updateForm("securityQuestion", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS.map((question) => (
                        <SelectItem key={question} value={question}>{question}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Security Answer</Label>
                  <Input value={form.securityAnswer} onChange={(e) => updateForm("securityAnswer", e.target.value)} required />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-4 md:col-span-2">
                  <div>
                    <div className="font-medium text-foreground">Two-Factor Authentication (2FA)</div>
                    <div className="text-sm text-muted-foreground">Enable extra login protection for this user account.</div>
                  </div>
                  <Switch checked={form.twoFactorEnabled} onCheckedChange={(checked) => updateForm("twoFactorEnabled", checked)} />
                </div>
              </div>
            ) : null}

            {step === 7 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Created By (Admin ID)</Label>
                  <Input value={form.createdBy} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Date Created</Label>
                  <Input value={new Date(form.dateCreated).toLocaleString()} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <Input value={new Date(form.lastUpdated).toLocaleString()} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Blockchain Anchor Status</Label>
                  <Input value={form.blockchainAnchorStatus} readOnly className="bg-muted/50" />
                </div>
              </div>
            ) : null}

            {step === 8 ? (
              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="text-base">Review & Submit</CardTitle>
                    <CardDescription>Confirm the full account profile before the user is created in TiDB and anchored into the system workflow.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
                    <div><span className="text-muted-foreground">Email Address:</span> {form.email || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Role:</span> {roleConfig.label}</div>
                    <div><span className="text-muted-foreground">Full Name:</span> {form.fullname || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Gender:</span> {form.gender}</div>
                    <div><span className="text-muted-foreground">Date of Birth:</span> {form.dateOfBirth || "Not entered"}</div>
                    <div><span className="text-muted-foreground">National ID / Passport:</span> {form.nationalId || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Phone Number:</span> {form.phoneNumber || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Residential Address:</span> {form.residentialAddress || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Rank:</span> {form.rank}</div>
                    <div><span className="text-muted-foreground">Badge Number:</span> {form.badge || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Years of Service:</span> {form.yearsOfService || "Not entered"}</div>
                    <div><span className="text-muted-foreground">Employment Status:</span> {form.employmentStatus}</div>
                    <div><span className="text-muted-foreground">Department:</span> {form.department}</div>
                    <div><span className="text-muted-foreground">Station:</span> {form.station}</div>
                    <div><span className="text-muted-foreground">Region:</span> {form.region}</div>
                    <div><span className="text-muted-foreground">Access Level:</span> {form.accessLevel}</div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Permissions:</span>{" "}
                      {PERMISSION_OPTIONS.filter((item) => form.permissions[item.key]).map((item) => item.label).join(", ") || "None selected"}
                    </div>
                    <div><span className="text-muted-foreground">Security Question:</span> {form.securityQuestion}</div>
                    <div><span className="text-muted-foreground">2FA:</span> {form.twoFactorEnabled ? "Enabled" : "Disabled"}</div>
                    <div><span className="text-muted-foreground">Created By:</span> {form.createdBy}</div>
                    <div><span className="text-muted-foreground">Blockchain Anchor Status:</span> {form.blockchainAnchorStatus}</div>
                  </CardContent>
                </Card>

                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="text-base">Submit & Create User</CardTitle>
                    <CardDescription>Use the back button if anything needs correction before saving.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Creating..." : "Submit & Create User"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {success ? <div className="text-sm text-primary">{success}</div> : null}

        {keys ? (
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div><span className="font-semibold">Public Key:</span> {keys.publicKey}</div>
              <div><span className="font-semibold">Private Key:</span> {keys.privateKey}</div>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/police-admin/dashboard")}>Cancel</Button>
            <Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Back
            </Button>
          </div>
          <div className="flex gap-3">
            {step < 8 ? (
              <Button type="button" onClick={() => goToStep(step + 1)}>
                Next
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
