function norm(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
}

export function toCanonicalRole(role: unknown) {
  const r = norm(role)

  const aliases: Record<string, string> = {
    administrator: "admin",
    system_admin: "admin",

    police: "police",
    police_user: "police",
    police_officer: "police",
    police_registry: "police",

    commissioner: "commissioner",
    police_commissioner: "commissioner",

    dpp_officer: "dpp",
    dpp_user: "dpp",

    court_registry: "registry",
    court_clerk: "clerk",

    investigator: "investigation",
    investigation: "investigation",
    investigation_officer: "investigation",
    police_investigator: "investigation",

    police_admin: "police_admin",
    prosecution_registry: "prosecution_registry",
    high_court_judge: "high_court_judge",
    high_court_registry: "high_court_registry",
    small_court_judge: "small_court_judge",
    small_court_registry: "small_court_registry",
    court_admin: "court_admin",
  }

  return aliases[r] ?? r
}
