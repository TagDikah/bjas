import type { CaseData, User } from "@/lib/blockchain"

/**
 * Section B (Police Docket) access rules:
 * - Police Commissioner: yes
 * - DPP: yes
 * - Prosecutor: yes (in demo we allow all prosecutors; in production scope to assigned)
 * - Police Officer: yes if they created/own the case (policeOfficerId match)
 * - Everyone else (including prosecution registry): no
 */
export function canAccessPoliceDocketSectionB(c: CaseData, u: User) {
  if (u.role === "police_commissioner") return true
  if (u.role === "dpp") return true
  if (u.role === "prosecutor") return true
  if (u.role === "police_officer" && c.policeOfficerId === u.id) return true
  return false
}
