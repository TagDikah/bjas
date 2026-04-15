"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"

type RoleOption = { value: string; label: string; accessLevel: string; department?: string; station?: string; title?: string }
type PermissionOption = { key: string; label: string }
type PresetUser = { label: string; email: string; role: string; fullname: string; department?: string; station?: string; title?: string }

export type RegistrationConfig = {
  pageTitle: string
  formTitle: string
  formDescription: string
  allowedRoles: readonly string[]
  cancelHref: string
  officeLabel: string
  roleOptions: readonly RoleOption[]
  permissionOptions: readonly PermissionOption[]
  defaultPermissions: Record<string, Record<string, boolean>>
  departmentOptions: readonly string[]
  stationOptions: readonly string[]
  regionOptions: readonly string[]
  titleOptions: readonly string[]
  courtLevelOptions?: readonly string[]
  roleAssignmentsHeading: string
  roleAssignmentsDescription: string
  roleSpecificPermissionLabels: readonly string[]
  presets?: readonly PresetUser[]
}

const STEPS = ["Account", "Identity", "Employment", "Role", "Security", "Review"] as const
const GENDERS = ["Male", "Female", "Other"] as const
const EMPLOYMENT = ["Active", "Suspended", "Pending Approval"] as const
const ACCESS = ["Read only", "Review", "Approve", "Admin"] as const
const VISIBILITY = ["Assigned cases only", "District only", "National"] as const
const QUESTIONS = ["What is your mother's maiden name?", "What was the name of your first school?", "What is your favorite childhood place?", "What was your first service posting?"] as const

function byRole(config: RegistrationConfig, role: string) {
  return config.roleOptions.find((item) => item.value === role) ?? config.roleOptions[0]
}

function defaults(config: RegistrationConfig, currentUser: any) {
  const role = config.roleOptions[0].value
  const roleConfig = byRole(config, role)
  return {
    fullname: "",
    email: "",
    username: "",
    password: "password123",
    confirmPassword: "password123",
    role,
    middleName: "",
    surname: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    residentialAddress: "",
    employeeNumber: "",
    title: roleConfig.title ?? config.titleOptions[0],
    badge: "",
    department: roleConfig.department ?? config.departmentOptions[0],
    station: roleConfig.station ?? config.stationOptions[0],
    region: config.regionOptions[0],
    supervisorName: "",
    supervisorEmail: "",
    workAddress: "",
    dateOfAppointment: "",
    employmentStatus: "Active",
    yearsOfService: "",
    courtLevelHandled: config.courtLevelOptions?.[0] ?? "",
    accessLevel: roleConfig.accessLevel,
    visibilityScope: "Assigned cases only",
    securityQuestion: QUESTIONS[0],
    securityAnswer: "",
    twoFactorEnabled: true,
    loginMonitoringEnabled: true,
    auditTrailEnabled: true,
    accountStatus: "Active",
    approvedBy: "",
    activationDate: "",
    createdBy: currentUser?.id || "Current Admin Session",
    permissions: { ...(config.defaultPermissions[role] ?? {}) },
    roleSpecificFlags: Object.fromEntries(config.roleSpecificPermissionLabels.map((item) => [item, false])),
  }
}

export function JusticeUserRegistrationForm({ config }: { config: RegistrationConfig }) {
  const router = useRouter()
  const currentUser = useStore((state: any) => state.currentUser)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [keys, setKeys] = useState<{ publicKey?: string; privateKey?: string } | null>(null)
  const [form, setForm] = useState(() => defaults(config, null))

  const roleConfig = useMemo(() => byRole(config, form.role), [config, form.role])

  useEffect(() => {
    setForm((current: any) => ({ ...current, createdBy: currentUser?.id || "Current Admin Session" }))
  }, [currentUser?.id])

  useEffect(() => {
    setForm((current: any) => ({
      ...current,
      accessLevel: roleConfig.accessLevel,
      department: roleConfig.department ?? current.department,
      station: roleConfig.station ?? current.station,
      title: roleConfig.title ?? current.title,
      permissions: { ...(config.defaultPermissions[form.role] ?? {}) },
    }))
  }, [config.defaultPermissions, form.role, roleConfig])

  function patch(next: Record<string, any>) {
    setForm((current: any) => ({ ...current, ...next }))
  }

  function patchPermission(key: string, checked: boolean) {
    setForm((current: any) => ({ ...current, permissions: { ...current.permissions, [key]: checked } }))
  }

  function patchRoleFlag(key: string, checked: boolean) {
    setForm((current: any) => ({ ...current, roleSpecificFlags: { ...current.roleSpecificFlags, [key]: checked } }))
  }

  function applyPreset(preset: PresetUser) {
    const nextRole = byRole(config, preset.role)
    patch({
      fullname: preset.fullname,
      email: preset.email,
      username: preset.email.split("@")[0],
      role: preset.role,
      department: preset.department ?? nextRole.department ?? form.department,
      station: preset.station ?? nextRole.station ?? form.station,
      title: preset.title ?? nextRole.title ?? nextRole.label,
      accessLevel: nextRole.accessLevel,
      permissions: { ...(config.defaultPermissions[preset.role] ?? {}) },
    })
    setStep(0)
  }

  function validate() {
    if (!form.fullname.trim() || !form.email.trim() || !form.password.trim() || form.password !== form.confirmPassword) {
      setError("Complete the account details and make sure passwords match.")
      setStep(0)
      return false
    }
    if (!form.dateOfBirth || !form.nationalId.trim() || !form.phoneNumber.trim()) {
      setError("Complete the identity section.")
      setStep(1)
      return false
    }
    if (!form.employeeNumber.trim() || !form.department.trim() || !form.station.trim()) {
      setError("Complete the employment section.")
      setStep(2)
      return false
    }
    if (!form.securityQuestion.trim() || !form.securityAnswer.trim()) {
      setError("Complete the security section.")
      setStep(4)
      return false
    }
    setError("")
    return true
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return
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
          badge: form.badge || form.employeeNumber,
          department: form.department,
          station: form.station,
          metadata: {
            office: config.officeLabel,
            profile: {
              middleName: form.middleName,
              surname: form.surname,
              gender: form.gender,
              dateOfBirth: form.dateOfBirth,
              nationalId: form.nationalId,
              phoneNumber: form.phoneNumber,
              alternativePhoneNumber: form.alternativePhoneNumber,
              residentialAddress: form.residentialAddress,
            },
            employment: {
              employeeNumber: form.employeeNumber,
              title: form.title,
              department: form.department,
              station: form.station,
              region: form.region,
              supervisorName: form.supervisorName,
              supervisorEmail: form.supervisorEmail,
              workAddress: form.workAddress,
              dateOfAppointment: form.dateOfAppointment,
              employmentStatus: form.employmentStatus,
              yearsOfService: form.yearsOfService,
            },
            assignment: {
              accessLevel: form.accessLevel,
              visibilityScope: form.visibilityScope,
              courtLevelHandled: form.courtLevelHandled,
              roleSpecificFlags: form.roleSpecificFlags,
            },
            permissions: form.permissions,
            security: {
              question: form.securityQuestion,
              answer: form.securityAnswer,
              twoFactorEnabled: form.twoFactorEnabled,
              loginMonitoringEnabled: form.loginMonitoringEnabled,
              auditTrailEnabled: form.auditTrailEnabled,
            },
            system: {
              accountStatus: form.accountStatus,
              createdBy: form.createdBy,
              approvedBy: form.approvedBy,
              activationDate: form.activationDate,
            },
            username: form.username,
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
      setStep(0)
      setForm(defaults(config, currentUser))
    } catch {
      setError("Network error while creating the user.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={[...config.allowedRoles]} title={config.pageTitle}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        {config.presets?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready-Made Users</CardTitle>
              <CardDescription>Load a prepared account and then complete the remaining fields.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {config.presets.map((preset) => (
                <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-2xl border border-border/80 bg-background/60 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5">
                  <div className="text-sm font-semibold text-white">{preset.label}</div>
                  <div className="mt-1 text-xs text-slate-300">{preset.email}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{config.formTitle}</CardTitle>
            <CardDescription>{config.formDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {STEPS.map((item, index) => (
                <button key={item} type="button" onClick={() => setStep(index)} className={`rounded-xl border px-3 py-2.5 text-left transition ${step === index ? "border-primary bg-primary/8 text-primary shadow-sm" : "border-border/80 bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step === index ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{index + 1}</span>
                    <span className="text-xs font-semibold leading-4 sm:text-[13px]">{item}</span>
                  </div>
                </button>
              ))}
            </div>

            {step === 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.fullname} onChange={(e) => patch({ fullname: e.target.value })} /></div>
              <div className="space-y-2"><Label>Work Email</Label><Input type="email" value={form.email} onChange={(e) => patch({ email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={(e) => patch({ username: e.target.value })} /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="text" minLength={8} value={form.password} onChange={(e) => patch({ password: e.target.value })} /></div>
              <div className="space-y-2"><Label>Confirm Password</Label><Input type="text" minLength={8} value={form.confirmPassword} onChange={(e) => patch({ confirmPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role In System</Label><Select value={form.role} onValueChange={(value) => patch({ role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.roleOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
            </div> : null}

            {step === 1 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2"><Label>Middle Name</Label><Input value={form.middleName} onChange={(e) => patch({ middleName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Surname</Label><Input value={form.surname} onChange={(e) => patch({ surname: e.target.value })} /></div>
              <div className="space-y-2"><Label>Gender</Label><Select value={form.gender} onValueChange={(value) => patch({ gender: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GENDERS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Date Of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => patch({ dateOfBirth: e.target.value })} /></div>
              <div className="space-y-2"><Label>National ID</Label><Input value={form.nationalId} onChange={(e) => patch({ nationalId: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input value={form.phoneNumber} onChange={(e) => patch({ phoneNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Alternative Phone</Label><Input value={form.alternativePhoneNumber} onChange={(e) => patch({ alternativePhoneNumber: e.target.value })} /></div>
              <div className="space-y-2 xl:col-span-2"><Label>Residential Address</Label><Input value={form.residentialAddress} onChange={(e) => patch({ residentialAddress: e.target.value })} /></div>
            </div> : null}

            {step === 2 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2"><Label>Employee Number</Label><Input value={form.employeeNumber} onChange={(e) => patch({ employeeNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Job Title</Label><Select value={form.title} onValueChange={(value) => patch({ title: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.titleOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Badge / Staff Number</Label><Input value={form.badge} onChange={(e) => patch({ badge: e.target.value })} /></div>
              <div className="space-y-2"><Label>Department</Label><Select value={form.department} onValueChange={(value) => patch({ department: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.departmentOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Office Station</Label><Select value={form.station} onValueChange={(value) => patch({ station: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.stationOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>District / Region</Label><Select value={form.region} onValueChange={(value) => patch({ region: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.regionOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Date Of Appointment</Label><Input type="date" value={form.dateOfAppointment} onChange={(e) => patch({ dateOfAppointment: e.target.value })} /></div>
              <div className="space-y-2"><Label>Employment Status</Label><Select value={form.employmentStatus} onValueChange={(value) => patch({ employmentStatus: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Years Of Service</Label><Input value={form.yearsOfService} onChange={(e) => patch({ yearsOfService: e.target.value })} /></div>
            </div> : null}

            {step === 3 ? <div className="space-y-5">
              <div><div className="text-sm font-semibold text-white">{config.roleAssignmentsHeading}</div><div className="mt-1 text-sm text-slate-300">{config.roleAssignmentsDescription}</div></div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2"><Label>Access Level</Label><Select value={form.accessLevel} onValueChange={(value) => patch({ accessLevel: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ACCESS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Case Visibility Scope</Label><Select value={form.visibilityScope} onValueChange={(value) => patch({ visibilityScope: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VISIBILITY.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                {config.courtLevelOptions?.length ? <div className="space-y-2"><Label>Court Level Handled</Label><Select value={form.courtLevelHandled} onValueChange={(value) => patch({ courtLevelHandled: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{config.courtLevelOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div> : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {config.roleSpecificPermissionLabels.map((label) => <label key={label} className="flex items-center gap-3 rounded-xl border border-border/80 px-4 py-3"><Checkbox checked={Boolean(form.roleSpecificFlags[label])} onCheckedChange={(checked) => patchRoleFlag(label, checked === true)} /><span className="text-sm text-white">{label}</span></label>)}
              </div>
            </div> : null}

            {step === 4 ? <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {config.permissionOptions.map((option) => <label key={option.key} className="flex items-center gap-3 rounded-xl border border-border/80 px-4 py-3"><Checkbox checked={Boolean(form.permissions[option.key])} onCheckedChange={(checked) => patchPermission(option.key, checked === true)} /><span className="text-sm text-white">{option.label}</span></label>)}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3"><span className="text-sm text-white">Two-factor authentication enabled</span><Switch checked={form.twoFactorEnabled} onCheckedChange={(checked) => patch({ twoFactorEnabled: checked })} /></div>
                <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3"><span className="text-sm text-white">Last login monitoring enabled</span><Switch checked={form.loginMonitoringEnabled} onCheckedChange={(checked) => patch({ loginMonitoringEnabled: checked })} /></div>
                <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3"><span className="text-sm text-white">Audit trail enabled</span><Switch checked={form.auditTrailEnabled} onCheckedChange={(checked) => patch({ auditTrailEnabled: checked })} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Security Question</Label><Select value={form.securityQuestion} onValueChange={(value) => patch({ securityQuestion: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QUESTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Security Answer</Label><Input value={form.securityAnswer} onChange={(e) => patch({ securityAnswer: e.target.value })} /></div>
              </div>
            </div> : null}

            {step === 5 ? <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/50 p-4"><div className="text-sm font-semibold text-white">Profile Summary</div><div className="mt-3 space-y-2 text-sm text-slate-200"><div><span className="text-white">Name:</span> {form.fullname || "-"}</div><div><span className="text-white">Role:</span> {roleConfig.label}</div><div><span className="text-white">Department:</span> {form.department || "-"}</div><div><span className="text-white">Station:</span> {form.station || "-"}</div><div><span className="text-white">Access:</span> {form.accessLevel}</div></div></div>
              <div className="rounded-2xl border border-border/80 bg-background/50 p-4"><div className="text-sm font-semibold text-white">Role Controls</div><div className="mt-3 space-y-2 text-sm text-slate-200">{Object.entries(form.roleSpecificFlags).filter(([, value]) => value).map(([key]) => <div key={key}>{key}</div>)}{!Object.values(form.roleSpecificFlags).some(Boolean) ? <div>No role-specific controls selected yet.</div> : null}</div></div>
            </div> : null}
          </CardContent>
        </Card>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {success ? <div className="text-sm text-primary">{success}</div> : null}
        {keys?.publicKey ? <Card><CardHeader><CardTitle>Blockchain Wallet Details</CardTitle><CardDescription>The user was created with a generated blockchain wallet.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm"><div><span className="font-semibold text-white">Public key:</span> <span className="break-all text-slate-200">{keys.publicKey}</span></div>{keys.privateKey ? <div><span className="font-semibold text-white">Private key:</span> <span className="break-all text-slate-200">{keys.privateKey}</span></div> : null}</CardContent></Card> : null}

        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex gap-3"><Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Previous</Button><Button type="button" variant="outline" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>Next</Button></div>
          <div className="flex gap-3"><Button type="button" variant="outline" onClick={() => router.push(config.cancelHref)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button></div>
        </div>
      </form>
    </DashboardLayout>
  )
}
