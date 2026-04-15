"use client"

import { JusticeUserRegistrationForm } from "@/components/admin/justice-user-registration-form"

const config = {
  pageTitle: "Register DPP User",
  formTitle: "DPP User Registration Form",
  formDescription: "Create DPP admins, registry officers, prosecutors, reviewers, and appellate counsel with a full prosecution profile and controlled permissions.",
  allowedRoles: ["dpp_admin", "admin"],
  cancelHref: "/dpp-admin/dashboard",
  officeLabel: "DPP",
  roleOptions: [
    { value: "dpp_admin", label: "DPP Admin", accessLevel: "Admin", department: "DPP Admin", station: "DPP Headquarters", title: "DPP Administrator" },
    { value: "dpp_registry", label: "DPP Registry Officer", accessLevel: "Review", department: "DPP Registry", station: "DPP Headquarters", title: "DPP Registry Officer" },
    { value: "prosecutor", label: "Prosecutor", accessLevel: "Approve", department: "Prosecution", station: "DPP Headquarters", title: "Prosecutor" },
    { value: "senior_prosecutor", label: "Senior Prosecutor", accessLevel: "Approve", department: "Prosecution", station: "DPP Headquarters", title: "Senior Prosecutor" },
    { value: "dpp_reviewer", label: "DPP Reviewer", accessLevel: "Review", department: "DPP Review", station: "DPP Headquarters", title: "DPP Reviewer" },
    { value: "appellate_prosecutor", label: "Appellate Counsel", accessLevel: "Approve", department: "Appeals Prosecution", station: "Court of Appeal Liaison Office", title: "Appellate Counsel" },
    { value: "dpp_secretary", label: "DPP Secretary / Support Staff", accessLevel: "Read only", department: "DPP Support", station: "DPP Headquarters", title: "DPP Secretary" },
  ] as const,
  permissionOptions: [
    { key: "manageUsers", label: "Manage DPP users" },
    { key: "assignProsecutors", label: "Assign prosecutors" },
    { key: "viewAllMatters", label: "View all DPP matters" },
    { key: "manageApprovals", label: "Manage approvals" },
    { key: "monitorAuditLog", label: "Monitor audit log" },
    { key: "prepareCharges", label: "Prepare charges" },
    { key: "fileToCourt", label: "File to court" },
    { key: "updateHearingNotes", label: "Update hearing notes" },
  ] as const,
  defaultPermissions: {
    dpp_admin: { manageUsers: true, assignProsecutors: true, viewAllMatters: true, manageApprovals: true, monitorAuditLog: true, prepareCharges: false, fileToCourt: false, updateHearingNotes: false },
    dpp_registry: { manageUsers: false, assignProsecutors: false, viewAllMatters: true, manageApprovals: false, monitorAuditLog: false, prepareCharges: false, fileToCourt: true, updateHearingNotes: false },
    prosecutor: { manageUsers: false, assignProsecutors: false, viewAllMatters: false, manageApprovals: false, monitorAuditLog: false, prepareCharges: true, fileToCourt: true, updateHearingNotes: true },
    senior_prosecutor: { manageUsers: false, assignProsecutors: true, viewAllMatters: true, manageApprovals: true, monitorAuditLog: false, prepareCharges: true, fileToCourt: true, updateHearingNotes: true },
    dpp_reviewer: { manageUsers: false, assignProsecutors: true, viewAllMatters: true, manageApprovals: true, monitorAuditLog: false, prepareCharges: false, fileToCourt: false, updateHearingNotes: false },
    appellate_prosecutor: { manageUsers: false, assignProsecutors: false, viewAllMatters: true, manageApprovals: false, monitorAuditLog: false, prepareCharges: true, fileToCourt: true, updateHearingNotes: true },
    dpp_secretary: { manageUsers: false, assignProsecutors: false, viewAllMatters: true, manageApprovals: false, monitorAuditLog: false, prepareCharges: false, fileToCourt: false, updateHearingNotes: false },
  },
  departmentOptions: ["DPP Admin", "DPP Registry", "Prosecution", "DPP Review", "Appeals Prosecution", "DPP Support"] as const,
  stationOptions: ["DPP Headquarters", "Maseru DPP Office", "Leribe DPP Office", "Mafeteng DPP Office", "Court of Appeal Liaison Office"] as const,
  regionOptions: ["Maseru", "Leribe", "Berea", "Mafeteng", "National"] as const,
  titleOptions: ["DPP Administrator", "DPP Registry Officer", "Prosecutor", "Senior Prosecutor", "DPP Reviewer", "Appellate Counsel", "DPP Secretary"] as const,
  courtLevelOptions: ["Subordinate Court", "High Court", "Court of Appeal"] as const,
  roleAssignmentsHeading: "DPP-Specific Role Assignment",
  roleAssignmentsDescription: "Separate registry, review, prosecution, and appeal powers so each DPP officer only receives the responsibilities attached to that office.",
  roleSpecificPermissionLabels: [
    "Can review police dockets",
    "Can return case for clarification",
    "Can assign prosecutor",
    "Can approve filing",
    "Can withdraw case",
    "Can escalate to senior review",
    "Can access appeal prosecution files",
  ] as const,
  presets: [
    { label: "DPP Admin", fullname: "DPP Admin", email: "kobobokangthabo27@gmail.com", role: "dpp_admin", department: "DPP Admin", station: "DPP Headquarters", title: "DPP Administrator" },
    { label: "DPP Prosecutor 1", fullname: "DPP Prosecutor 1", email: "bejas.dpp.prosecutor1@gmail.com", role: "prosecutor", department: "Prosecution", station: "DPP Headquarters", title: "Prosecutor" },
    { label: "DPP Prosecutor 2", fullname: "DPP Prosecutor 2", email: "bejas.dpp.prosecutor2@gmail.com", role: "prosecutor", department: "Prosecution", station: "DPP Headquarters", title: "Prosecutor" },
    { label: "DPP Registry 1", fullname: "DPP Registry 1", email: "bejas.dpp.registry1@gmail.com", role: "dpp_registry", department: "DPP Registry", station: "DPP Headquarters", title: "DPP Registry Officer" },
  ] as const,
} as const

export default function DppAdminRegisterPage() {
  return <JusticeUserRegistrationForm config={config} />
}
