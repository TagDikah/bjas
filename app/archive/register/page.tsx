"use client"

import { JusticeUserRegistrationForm } from "@/components/admin/justice-user-registration-form"

const config = {
  pageTitle: "Register Archive User",
  formTitle: "Archive And Records User Registration Form",
  formDescription: "Register archive officers, records managers, digital records clerks, and retrieval officers for closed-file retention, preservation, and lawful access control.",
  allowedRoles: ["archive_officer", "court_admin", "admin"],
  cancelHref: "/archive/dashboard",
  officeLabel: "Archive And Records",
  roleOptions: [
    { value: "archive_officer", label: "Archive Officer", accessLevel: "Review", department: "Archive Operations", station: "Central Archive Office", title: "Archive Officer" },
    { value: "records_manager", label: "Records Manager", accessLevel: "Approve", department: "Records Management", station: "Central Archive Office", title: "Records Manager" },
    { value: "digital_records_clerk", label: "Digital Records Clerk", accessLevel: "Read only", department: "Digital Archive", station: "Central Archive Office", title: "Digital Records Clerk" },
    { value: "archive_retrieval_officer", label: "Case File Retrieval Officer", accessLevel: "Review", department: "Archive Retrieval", station: "Central Archive Office", title: "Archive Retrieval Officer" },
  ] as const,
  permissionOptions: [
    { key: "receiveArchivedFile", label: "Receive archived file" },
    { key: "indexArchivedFile", label: "Index archived file" },
    { key: "retrieveFile", label: "Retrieve file" },
    { key: "markFileRestricted", label: "Mark file as restricted" },
    { key: "digitizeFile", label: "Digitize file" },
    { key: "exportCertifiedCopy", label: "Export certified copy" },
    { key: "viewDestructionSchedule", label: "View destruction schedule" },
    { key: "transferLongTermArchive", label: "Transfer to long-term archive" },
  ] as const,
  defaultPermissions: {
    archive_officer: { receiveArchivedFile: true, indexArchivedFile: true, retrieveFile: true, markFileRestricted: true, digitizeFile: true, exportCertifiedCopy: false, viewDestructionSchedule: true, transferLongTermArchive: true },
    records_manager: { receiveArchivedFile: true, indexArchivedFile: true, retrieveFile: true, markFileRestricted: true, digitizeFile: true, exportCertifiedCopy: true, viewDestructionSchedule: true, transferLongTermArchive: true },
    digital_records_clerk: { receiveArchivedFile: false, indexArchivedFile: true, retrieveFile: false, markFileRestricted: false, digitizeFile: true, exportCertifiedCopy: false, viewDestructionSchedule: false, transferLongTermArchive: false },
    archive_retrieval_officer: { receiveArchivedFile: false, indexArchivedFile: false, retrieveFile: true, markFileRestricted: true, digitizeFile: false, exportCertifiedCopy: true, viewDestructionSchedule: false, transferLongTermArchive: false },
  },
  departmentOptions: ["Archive Operations", "Records Management", "Digital Archive", "Archive Retrieval"] as const,
  stationOptions: ["Central Archive Office", "Digital Preservation Unit", "Records Vault"] as const,
  regionOptions: ["Maseru", "National"] as const,
  titleOptions: ["Archive Officer", "Records Manager", "Digital Records Clerk", "Archive Retrieval Officer"] as const,
  roleAssignmentsHeading: "Archive And Records Assignment",
  roleAssignmentsDescription: "Control retention, retrieval, digitization, and long-term preservation carefully so only the right records staff can handle closed files and archive actions.",
  roleSpecificPermissionLabels: [
    "Can receive archived file",
    "Can index archived file",
    "Can retrieve file",
    "Can mark file as restricted",
    "Can digitize file",
    "Can export certified copy",
    "Can view destruction schedule",
    "Can transfer to long-term archive",
  ] as const,
  presets: [
    { label: "Archive Officer 1", fullname: "Archive Officer 1", email: "bejas.archive.officer1@gmail.com", role: "archive_officer", department: "Archive Operations", station: "Central Archive Office", title: "Archive Officer" },
  ] as const,
} as const

export default function ArchiveRegisterPage() {
  return <JusticeUserRegistrationForm config={config} />
}
