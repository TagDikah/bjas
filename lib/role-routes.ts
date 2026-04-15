import { toCanonicalRole } from "./roles"

export const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",

  clerk: "/clerk/dashboard",

  commissioner: "/commissioner/dashboard",
  police_commissioner: "/commissioner/dashboard",

  court_admin: "/court-admin/dashboard",
  dpp_admin: "/dpp-admin/dashboard",

  dpp: "/dpp/dashboard",
  prosecutor: "/prosecutor/dashboard",
  prosecution_registry: "/prosecution-registry/dashboard",
  correctional_services: "/correctional-services/dashboard",
  correctional_admin: "/correctional-services/dashboard",
  appeal_registry: "/appeal-registry/dashboard",
  appeal_judge: "/appeal-registry/dashboard",
  archive_officer: "/archive/dashboard",

  police_investigator: "/investigation/dashboard",
  investigation: "/investigation/dashboard",
  investigator: "/investigation/dashboard",
  investigation_officer: "/investigation/dashboard",

  judge: "/judge/dashboard",
  magistrate: "/magistrate",

  police_officer: "/police/dashboard",
  police: "/police/dashboard",

  police_admin: "/police-admin/dashboard",

  registry: "/registry/dashboard",
  court_registry: "/registry/dashboard",

  high_court: "/high-court",
  high_court_judge: "/high-court-judge/dashboard",
  high_court_registry: "/high-court-registry/dashboard",
  high_court_registry_assistant: "/high-court-registry/assistant/dashboard",

  small_court_judge: "/small-court-judge/dashboard",
  small_court_magistrate: "/small-court-judge/dashboard",
  small_court_registry: "/small-court-registry/dashboard",
  small_court_registry_assistant: "/small-court-registry/dashboard",
}

export function getRoleRoute(role?: string | null): string {
  if (!role) return "/login"
  const canonicalRole = toCanonicalRole(role)
  return ROLE_ROUTES[canonicalRole] || "/dashboard"
}
