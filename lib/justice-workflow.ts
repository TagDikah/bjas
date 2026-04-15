export type JusticeWorkflowStatus =
  | "draft_police"
  | "pending_police_intake"
  | "registered_at_police"
  | "pending_investigation"
  | "assigned_to_investigator"
  | "in_investigation"
  | "investigation_completed"
  | "pending_commissioner"
  | "commissioner_clarification"
  | "commissioner_approved"
  | "rejected"
  | "submitted_to_dpp"
  | "dpp_registry_intake"
  | "assigned_to_prosecutor"
  | "returned_to_police"
  | "filed_to_high_court"
  | "high_court_registry_intake"
  | "assigned_to_high_court_judge"
  | "first_appearance"
  | "bail_stage"
  | "trial_in_progress"
  | "judgment_delivered"
  | "sentenced"
  | "transferred_to_correctional_services"
  | "serving_sentence"
  | "parole_review"
  | "released"
  | "appealed"
  | "appeal_in_progress"
  | "appeal_decided"
  | "case_closed"
  | "case_archived"

export const JUSTICE_BLOCKCHAIN_EVENTS = [
  "CASE_OPENED",
  "CASE_REGISTERED",
  "STATEMENT_ADDED",
  "EVIDENCE_ADDED",
  "EXHIBIT_LOGGED",
  "CASE_ASSIGNED_TO_INVESTIGATOR",
  "INVESTIGATION_STARTED",
  "INVESTIGATION_UPDATED",
  "INVESTIGATION_COMPLETED",
  "SUBMITTED_TO_COMMISSIONER",
  "COMMISSIONER_APPROVED",
  "COMMISSIONER_REJECTED",
  "COMMISSIONER_RETURNED_FOR_CLARIFICATION",
  "CASE_RESUBMITTED",
  "SUBMITTED_TO_DPP_REGISTRY",
  "DPP_REGISTRY_RECEIVED",
  "REGISTERED_BY_DPP_REGISTRY",
  "RETURNED_TO_POLICE",
  "DPP_REVIEW_STARTED",
  "DPP_APPROVED_FOR_PROSECUTION",
  "DPP_DECLINED_PROSECUTION",
  "PROSECUTOR_ASSIGNED",
  "PROSECUTION_PREPARED",
  "FILED_TO_COURT",
  "COURT_REGISTRY_RECEIVED",
  "HEARING_SCHEDULED",
  "ASSIGNED_TO_JUDGE",
  "FIRST_APPEARANCE_RECORDED",
  "BAIL_GRANTED",
  "BAIL_DENIED",
  "TRIAL_STARTED",
  "EVIDENCE_ADMITTED",
  "JUDGMENT_DELIVERED",
  "SENTENCE_IMPOSED",
  "OFFENDER_ADMITTED_TO_CORRECTIONAL_SERVICE",
  "SENTENCE_EXECUTION_STARTED",
  "PAROLE_REVIEW_SCHEDULED",
  "PAROLE_GRANTED",
  "OFFENDER_RELEASED",
  "APPEAL_FILED",
  "APPEAL_REGISTERED",
  "APPEAL_HEARD",
  "APPEAL_DECIDED",
  "CASE_CLOSED",
  "CASE_ARCHIVED",
] as const

export const JUSTICE_WORKFLOW_PHASES = [
  {
    key: "police",
    title: "Police Intake and Investigation",
    statuses: [
      "draft_police",
      "pending_police_intake",
      "registered_at_police",
      "pending_investigation",
      "assigned_to_investigator",
      "in_investigation",
      "investigation_completed",
    ],
  },
  {
    key: "commissioner",
    title: "Commissioner Review",
    statuses: ["pending_commissioner", "commissioner_clarification", "commissioner_approved", "rejected"],
  },
  {
    key: "dpp",
    title: "DPP and Prosecution",
    statuses: ["submitted_to_dpp", "dpp_registry_intake", "assigned_to_prosecutor", "returned_to_police"],
  },
  {
    key: "court",
    title: "Court Registry and Hearing",
    statuses: [
      "filed_to_high_court",
      "high_court_registry_intake",
      "assigned_to_high_court_judge",
      "first_appearance",
      "bail_stage",
      "trial_in_progress",
      "judgment_delivered",
      "sentenced",
    ],
  },
  {
    key: "correctional",
    title: "Correctional Services",
    statuses: ["transferred_to_correctional_services", "serving_sentence", "parole_review", "released"],
  },
  {
    key: "appeal",
    title: "Appeal and Closure",
    statuses: ["appealed", "appeal_in_progress", "appeal_decided", "case_closed", "case_archived"],
  },
] as const
