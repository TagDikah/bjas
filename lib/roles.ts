function norm(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
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
    policecommissioner: "commissioner",

    dpp: "dpp",
    dpp_officer: "dpp",
    dpp_user: "dpp",
    dpp_admin: "dpp_admin",
    director_of_public_prosecutions_admin: "dpp_admin",
    dpp_reviewer: "dpp",
    dpp_secretary: "prosecution_registry",
    dpp_support_staff: "prosecution_registry",

    prosecutor: "prosecutor",
    dpp_prosecutor: "prosecutor",
    prosecutor_dpp: "prosecutor",
    dpp_prosecutor_user: "prosecutor",
    dpp_prosecution_officer: "prosecutor",
    prosecutor_preparation: "prosecutor",
    senior_prosecutor: "prosecutor",
    appellate_prosecutor: "prosecutor",
    appeals_prosecutor: "prosecutor",
    appellate_counsel: "prosecutor",

    dpp_registry: "prosecution_registry",
    dppregistry: "prosecution_registry",
    dpp_reg: "prosecution_registry",
    dpp_registry_officer: "prosecution_registry",
    dpp_registry_user: "prosecution_registry",
    prosecution_registry: "prosecution_registry",

    court_registry: "registry",
    registry: "registry",
    court_clerk: "clerk",
    clerk: "clerk",
    judge_clerk: "clerk",
    high_court_judge_clerk: "clerk",

    investigator: "investigation",
    investigation: "investigation",
    investigation_officer: "investigation",
    police_investigator: "investigation",

    police_admin: "police_admin",
    court_admin: "court_admin",
    correctional_services: "correctional_services",
    correctional_service: "correctional_services",
    prison_officer: "correctional_services",
    inmate_registry: "correctional_services",
    corrections_admin: "correctional_admin",
    correctional_admin: "correctional_admin",
    correctional_commissioner: "correctional_admin",
    correctional_officer: "correctional_services",
    receiving_officer: "correctional_services",
    sentence_records_officer: "correctional_services",
    inmate_records_clerk: "correctional_services",
    rehabilitation_officer: "correctional_services",
    release_officer: "correctional_services",
    parole_review_officer: "correctional_services",
    visitor_control_officer: "correctional_services",
    appeal_registry: "appeal_registry",
    appeals_registry: "appeal_registry",
    appellate_registry: "appeal_registry",
    appeal_registrar: "appeal_registry",
    appeal_clerk: "appeal_registry",
    appeal_judge: "appeal_judge",
    high_court_appeal_judge: "appeal_judge",
    appellate_judge: "appeal_judge",
    archive_officer: "archive_officer",
    records_manager: "archive_officer",
    digital_records_clerk: "archive_officer",
    evidence_archive_clerk: "archive_officer",
    case_file_retrieval_officer: "archive_officer",
    archive_retrieval_officer: "archive_officer",
    case_archive: "archive_officer",

    judge: "judge",
    magistrate: "magistrate",

    small_court_judge: "small_court_judge",
    small_court_magistrate: "small_court_magistrate",
    magistrate_court_judge: "small_court_judge",
    magistrate_court_magistrate: "small_court_magistrate",

    small_court_registry: "small_court_registry",
    magistrate_registry: "small_court_registry",
    magistrate_court_registry: "small_court_registry",
    mag_registry: "small_court_registry",

    small_court_registry_assistant: "small_court_registry_assistant",
    magistrate_registry_assistant: "small_court_registry_assistant",
    mag_assist_registry: "small_court_registry_assistant",
    mag_assistant_registry: "small_court_registry_assistant",
    magistrate_assistant_registry: "small_court_registry_assistant",

    high_court_judge: "high_court_judge",
    high_judge: "high_court_judge",

    high_court_registry: "high_court_registry",
    high_registry: "high_court_registry",
    high_court_registry_officer: "high_court_registry",

    high_court_registry_assistant: "high_court_registry_assistant",
    high_assist_registry: "high_court_registry_assistant",
    high_assistant_registry: "high_court_registry_assistant",
    high_registry_assistant: "high_court_registry_assistant",
  }

  return aliases[r] ?? r
}
