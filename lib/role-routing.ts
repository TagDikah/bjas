export function roleToPath(roleRaw: any) {
  const role = String(roleRaw ?? "").trim().toUpperCase()

  if (role === "ADMIN") return "/admin"

  // DPP
  if (role.startsWith("DPP_")) return "/dpp"

  // Police
  if (role.startsWith("POLICE_")) return "/police"

  // High Court
  if (role === "JUDGE" || role.startsWith("HIGH_")) return "/high-court"

  // Magistrate Court
  if (role === "MAGISTRATE" || role.startsWith("MAG_")) return "/magistrate"

  // fallback
  return "/dashboard"
}
