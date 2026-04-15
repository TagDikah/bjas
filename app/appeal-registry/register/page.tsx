"use client"

import { JusticeUserRegistrationForm } from "@/components/admin/justice-user-registration-form"

const config = {
  pageTitle: "Register Appeal Court User",
  formTitle: "Appeal Court User Registration Form",
  formDescription: "Create appeal registry officers, registrars, clerks, and appeal judges with registry scheduling, record compilation, and appellate decision controls.",
  allowedRoles: ["appeal_registry", "appeal_judge", "court_admin", "admin"],
  cancelHref: "/appeal-registry/dashboard",
  officeLabel: "Appeal Court",
  roleOptions: [
    { value: "appeal_registry", label: "Appeal Registry Officer", accessLevel: "Review", department: "Appeal Registry", station: "Court of Appeal", title: "Appeal Registry Officer" },
    { value: "appeal_registrar", label: "Appeal Registrar", accessLevel: "Approve", department: "Appeal Registry", station: "Court of Appeal", title: "Appeal Registrar" },
    { value: "appeal_clerk", label: "Appeal Clerk", accessLevel: "Read only", department: "Appeal Registry", station: "Court of Appeal", title: "Appeal Clerk" },
    { value: "appeal_judge", label: "Appeal Judge", accessLevel: "Approve", department: "Appeal Bench", station: "Court of Appeal", title: "Appeal Judge" },
  ] as const,
  permissionOptions: [
    { key: "registerAppeal", label: "Register appeal" },
    { key: "issueAppealNumber", label: "Issue appeal case number" },
    { key: "scheduleRecordCompilation", label: "Schedule record compilation" },
    { key: "uploadLowerCourtRecord", label: "Upload lower-court record" },
    { key: "notifyParties", label: "Notify parties" },
    { key: "assignAppealBench", label: "Assign appeal bench file" },
    { key: "publishHearingDate", label: "Publish hearing date" },
    { key: "recordJudgmentDate", label: "Record judgment delivery date" },
  ] as const,
  defaultPermissions: {
    appeal_registry: { registerAppeal: true, issueAppealNumber: true, scheduleRecordCompilation: true, uploadLowerCourtRecord: true, notifyParties: true, assignAppealBench: false, publishHearingDate: true, recordJudgmentDate: false },
    appeal_registrar: { registerAppeal: true, issueAppealNumber: true, scheduleRecordCompilation: true, uploadLowerCourtRecord: true, notifyParties: true, assignAppealBench: true, publishHearingDate: true, recordJudgmentDate: true },
    appeal_clerk: { registerAppeal: false, issueAppealNumber: false, scheduleRecordCompilation: true, uploadLowerCourtRecord: true, notifyParties: true, assignAppealBench: false, publishHearingDate: false, recordJudgmentDate: false },
    appeal_judge: { registerAppeal: false, issueAppealNumber: false, scheduleRecordCompilation: false, uploadLowerCourtRecord: false, notifyParties: false, assignAppealBench: true, publishHearingDate: false, recordJudgmentDate: true },
  },
  departmentOptions: ["Appeal Registry", "Appeal Bench"] as const,
  stationOptions: ["Court of Appeal", "Appeal Registry Office"] as const,
  regionOptions: ["Maseru", "National"] as const,
  titleOptions: ["Appeal Registry Officer", "Appeal Registrar", "Appeal Clerk", "Appeal Judge"] as const,
  courtLevelOptions: ["Court of Appeal"] as const,
  roleAssignmentsHeading: "Appeal Registry And Judicial Assignment",
  roleAssignmentsDescription: "Separate the appeal registry workflow from the judicial decision role so the appeal bench and registry each receive the correct case powers.",
  roleSpecificPermissionLabels: [
    "Can register appeal",
    "Can issue appeal case number",
    "Can schedule record compilation",
    "Can upload lower-court record",
    "Can notify parties",
    "Can assign appeal bench file",
    "Can publish hearing date",
    "Can record judgment delivery date",
    "Can request missing record",
    "Can sign final decision",
  ] as const,
  presets: [
    { label: "Appeal Registry 1", fullname: "Appeal Registry 1", email: "nalanekekeletso@gmail.com", role: "appeal_registry", department: "Appeal Registry", station: "Court of Appeal", title: "Appeal Registry Officer" },
    { label: "Appeal Judge 1", fullname: "Appeal Judge 1", email: "bejas.appeal.judge1@gmail.com", role: "appeal_judge", department: "Appeal Bench", station: "Court of Appeal", title: "Appeal Judge" },
  ] as const,
} as const

export default function AppealRegisterPage() {
  return <JusticeUserRegistrationForm config={config} />
}
