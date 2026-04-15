"use client"

import { JusticeUserRegistrationForm } from "@/components/admin/justice-user-registration-form"

const config = {
  pageTitle: "Register Correctional User",
  formTitle: "Correctional Services User Registration Form",
  formDescription: "Register prison operations, sentence records, rehabilitation, release, and visitation staff with correctional workflow access.",
  allowedRoles: ["correctional_admin", "admin"],
  cancelHref: "/correctional-services/dashboard",
  officeLabel: "Correctional Services",
  roleOptions: [
    { value: "correctional_admin", label: "Correctional Admin", accessLevel: "Admin", department: "Correctional Admin", station: "Maseru Central Correctional Centre", title: "Correctional Administrator" },
    { value: "correctional_officer", label: "Correctional Officer", accessLevel: "Approve", department: "Custody Operations", station: "Maseru Central Correctional Centre", title: "Correctional Officer" },
    { value: "receiving_officer", label: "Receiving Officer", accessLevel: "Review", department: "Receiving Unit", station: "Maseru Central Correctional Centre", title: "Receiving Officer" },
    { value: "sentence_records_officer", label: "Sentence Records Officer", accessLevel: "Review", department: "Sentence Records", station: "Maseru Central Correctional Centre", title: "Sentence Records Officer" },
    { value: "rehabilitation_officer", label: "Rehabilitation Officer", accessLevel: "Review", department: "Rehabilitation", station: "Maseru Central Correctional Centre", title: "Rehabilitation Officer" },
    { value: "release_officer", label: "Release Officer", accessLevel: "Approve", department: "Release And Transfer", station: "Maseru Central Correctional Centre", title: "Release Officer" },
    { value: "parole_review_officer", label: "Parole Review Officer", accessLevel: "Approve", department: "Parole Review", station: "Maseru Central Correctional Centre", title: "Parole Review Officer" },
    { value: "visitor_control_officer", label: "Visitor Control Officer", accessLevel: "Read only", department: "Visitor Control", station: "Maseru Central Correctional Centre", title: "Visitor Control Officer" },
  ] as const,
  permissionOptions: [
    { key: "manageCorrectionalUsers", label: "Manage correctional users" },
    { key: "receiveInmates", label: "Receive inmates" },
    { key: "recordMovements", label: "Record inmate movements" },
    { key: "updateCustodyStatus", label: "Update custody status" },
    { key: "processTransfers", label: "Process transfer" },
    { key: "processParole", label: "Process parole recommendation" },
    { key: "processRelease", label: "Process release order" },
    { key: "printMovementSheets", label: "Print movement sheet" },
  ] as const,
  defaultPermissions: {
    correctional_admin: { manageCorrectionalUsers: true, receiveInmates: true, recordMovements: true, updateCustodyStatus: true, processTransfers: true, processParole: true, processRelease: true, printMovementSheets: true },
    correctional_officer: { manageCorrectionalUsers: false, receiveInmates: true, recordMovements: true, updateCustodyStatus: true, processTransfers: false, processParole: false, processRelease: false, printMovementSheets: true },
    receiving_officer: { manageCorrectionalUsers: false, receiveInmates: true, recordMovements: true, updateCustodyStatus: false, processTransfers: false, processParole: false, processRelease: false, printMovementSheets: true },
    sentence_records_officer: { manageCorrectionalUsers: false, receiveInmates: false, recordMovements: true, updateCustodyStatus: true, processTransfers: true, processParole: true, processRelease: true, printMovementSheets: true },
    rehabilitation_officer: { manageCorrectionalUsers: false, receiveInmates: false, recordMovements: false, updateCustodyStatus: false, processTransfers: false, processParole: true, processRelease: false, printMovementSheets: false },
    release_officer: { manageCorrectionalUsers: false, receiveInmates: false, recordMovements: true, updateCustodyStatus: true, processTransfers: true, processParole: true, processRelease: true, printMovementSheets: true },
    parole_review_officer: { manageCorrectionalUsers: false, receiveInmates: false, recordMovements: false, updateCustodyStatus: false, processTransfers: false, processParole: true, processRelease: true, printMovementSheets: false },
    visitor_control_officer: { manageCorrectionalUsers: false, receiveInmates: false, recordMovements: false, updateCustodyStatus: false, processTransfers: false, processParole: false, processRelease: false, printMovementSheets: false },
  },
  departmentOptions: ["Correctional Admin", "Custody Operations", "Receiving Unit", "Sentence Records", "Rehabilitation", "Release And Transfer", "Parole Review", "Visitor Control"] as const,
  stationOptions: ["Maseru Central Correctional Centre", "Mafeteng Correctional Centre", "Leribe Correctional Centre", "Berea Correctional Centre"] as const,
  regionOptions: ["Maseru", "Leribe", "Berea", "Mafeteng", "National"] as const,
  titleOptions: ["Correctional Administrator", "Correctional Officer", "Receiving Officer", "Sentence Records Officer", "Rehabilitation Officer", "Release Officer", "Parole Review Officer", "Visitor Control Officer"] as const,
  roleAssignmentsHeading: "Correctional Role Assignment",
  roleAssignmentsDescription: "Assign prison operations powers for admission, custody, rehabilitation, parole, release, and visitation according to each officer's legal duty.",
  roleSpecificPermissionLabels: [
    "Can admit inmate",
    "Can update custody status",
    "Can record sentence start date",
    "Can record sentence completion",
    "Can update rehabilitation notes",
    "Can process transfer",
    "Can process parole recommendation",
    "Can process release order",
    "Can print inmate movement sheet",
  ] as const,
  presets: [
    { label: "Correctional Admin", fullname: "Correctional Admin", email: "litsitsontsooa043@gmail.com", role: "correctional_admin", department: "Correctional Admin", station: "Maseru Central Correctional Centre", title: "Correctional Administrator" },
    { label: "Correctional Officer 1", fullname: "Correctional Officer 1", email: "bejas.correctional.officer1@gmail.com", role: "correctional_officer", department: "Custody Operations", station: "Maseru Central Correctional Centre", title: "Correctional Officer" },
  ] as const,
} as const

export default function CorrectionalRegisterPage() {
  return <JusticeUserRegistrationForm config={config} />
}
