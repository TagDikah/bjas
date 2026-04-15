"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CaseData, User } from "@/lib/blockchain"
import type { CaseActivity, PublicSubmissionType } from "@/lib/public-case-tracking"
import { makeActivityId, publicSubmissionToActivityType } from "@/lib/public-case-tracking"

type NewCaseInput = Omit<CaseData, "caseId" | "status" | "createdAt" | "updatedAt">
type PublicSubmissionInput = {
  type: PublicSubmissionType
  message: string
  submitterName?: string
}

type BlockchainAnchorRecord = {
  transactionId: string
  txHash: string
  blockNumber: number | null
  contentHash: string
  channelName?: string
  chaincodeName?: string
  anchoredAt: string
  action: string
  warning?: string | null
}

export type CourtStatisticsFormRecord = {
  id: string
  submittedAt: string
  submittedById: string
  submittedByName: string
  forwardedToRole: "high_court_registry_assistant"
  status: "sent_to_assistant" | "received_by_assistant"
  dateRegistered: string
  dateOfOccurrence: string
  nationalId: string
  policeDppReference: string
  courtFileNo: string
  placeOfOccurrence: string
  accusedName: string
  nationality: string
  citizenship: string
  placeOfBirth: string
  age: string
  sex: string
  educationStatus: string
  maritalStatus: string
  employmentStatus: string
  relationshipToVictim: string
  previousOffences: string
  chargeDetails: string
  accusedStatus: string
  judgeOrMagistrate: string
  allocationDate: string
  completionDate: string
  caseStatus: string
  remarks: string
}

export interface StoreState {
  currentUser: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  users: User[]
  cases: CaseData[]
  caseActivities: CaseActivity[]
  courtStatisticsForms: CourtStatisticsFormRecord[]
  setCurrentUser: (user: User | null) => void
  setHydrated: (value: boolean) => void
  logout: () => void
  getUsers: () => User[]
  getUsersByRole: (role: string) => User[]
  getAllCases: () => CaseData[]
  getCaseById: (caseId: string) => CaseData | undefined
  getCaseActivities: (caseId?: string) => CaseActivity[]
  appendCaseActivity: (activity: Omit<CaseActivity, "id" | "createdAt">) => void
  addPublicSubmission: (caseId: string, input: PublicSubmissionInput) => void
  submitCourtStatisticsForm: (
    payload: Omit<
      CourtStatisticsFormRecord,
      "id" | "submittedAt" | "submittedById" | "submittedByName" | "forwardedToRole" | "status"
    >
  ) => CourtStatisticsFormRecord | null
  getCourtStatisticsForms: () => CourtStatisticsFormRecord[]
  markCourtStatisticsFormReceived: (id: string) => void
  setCases: (cases: CaseData[]) => void
  addCase: (caseData: CaseData) => void
  createCase: (caseData: NewCaseInput) => CaseData
  updateCase: (caseId: string, patch: Partial<CaseData>) => void
  submitToInvestigation: (caseId: string, submittedBy?: User | null) => void
  startInvestigation: (caseId: string, investigator?: User | null) => void
  submitToCommissioner: (caseId: string, investigator?: User | null, notes?: string) => void
  commissionerApproveCase: (caseId: string, user?: User | null, notes?: string) => void
  commissionerRejectCase: (caseId: string, user?: User | null, notes?: string) => void
  commissionerRequestClarification: (caseId: string, user?: User | null, notes?: string) => void
  dppRegisterCase: (caseId: string, user?: User | null, notes?: string) => void
  dppAssignToProsecutor: (caseId: string, user?: User | null, prosecutor?: User | null) => void
  dppReturnToPolice: (caseId: string, user?: User | null, notes?: string) => void
  prosecutorFileToCourtRegistry: (caseId: string, user?: User | null, notes?: string) => void
  prosecutorReturnToPolice: (caseId: string, user?: User | null, notes?: string) => void
  highCourtRegistryIntake: (
    caseId: string,
    user?: User | null,
    courtCaseNumber?: string,
    notes?: string,
    intakeFormData?: Record<string, string>
  ) => void
  highCourtAssignJudge: (caseId: string, judge?: User | null, clerk?: User | null) => void
  assignClerkToCase: (caseId: string, clerk?: User | null) => void
}

export type { User, CaseData }

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function actorDisplayName(user?: Partial<User> | null, fallback = "System") {
  return String(user?.name || user?.fullName || fallback).trim() || fallback
}

function prependCaseActivity(
  existing: CaseActivity[],
  activity: Omit<CaseActivity, "id" | "createdAt">
) {
  return [
    {
      ...activity,
      id: makeActivityId(),
      createdAt: new Date().toISOString(),
    },
    ...existing,
  ]
}

function sanitizePersistedCase(caseData: CaseData) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const safeSectionA = {
    openedAt: sectionA.openedAt,
    station: sectionA.station,
    stnCode: sectionA.stnCode,
    crimeNo: sectionA.crimeNo,
    crimeYear: sectionA.crimeYear,
    crimeRegion: sectionA.crimeRegion,
    dateReported: sectionA.dateReported,
    timeReported: sectionA.timeReported,
    methodOfComplaint: sectionA.methodOfComplaint,
    reportingPersonFullName: sectionA.reportingPersonFullName,
    aggrievedFullName: sectionA.aggrievedFullName,
    allegedCrime: sectionA.allegedCrime,
    whereCommitted: sectionA.whereCommitted,
    whereCommittedSpecify: sectionA.whereCommittedSpecify,
    modusOperandi: sectionA.modusOperandi,
    suspectDetails: sectionA.suspectDetails,
    witnessList: sectionA.witnessList,
    summary: sectionA.summary,
    currentEditingStepIndex: sectionA.currentEditingStepIndex,
    currentEditingStepKey: sectionA.currentEditingStepKey,
    draftLastSavedAt: sectionA.draftLastSavedAt,
    checkpointLockedThrough: sectionA.checkpointLockedThrough,
    lastCheckpointStepIndex: sectionA.lastCheckpointStepIndex,
    submittedToInvestigationAt: sectionA.submittedToInvestigationAt,
    submittedToInvestigationById: sectionA.submittedToInvestigationById,
    submittedToInvestigationByName: sectionA.submittedToInvestigationByName,
    stepCheckpointErrors: sectionA.stepCheckpointErrors,
  }

  return {
    caseId: caseData.caseId,
    caseNumber: caseData.caseNumber,
    citation: caseData.citation,
    district: caseData.district,
    parties: caseData.parties,
    charge: caseData.charge,
    description: caseData.description,
    policeOfficerId: caseData.policeOfficerId,
    policeOfficerName: caseData.policeOfficerName,
    policeStationId: caseData.policeStationId,
    status: caseData.status,
    createdAt: caseData.createdAt,
    updatedAt: caseData.updatedAt,
    chainAnchor: caseData.chainAnchor,
    blockchainHistory: Array.isArray((caseData as any).blockchainHistory)
      ? (caseData as any).blockchainHistory
      : [],
    blockchainStatus: (caseData as any).blockchainStatus,
    prosecutionRegistry: caseData.prosecutionRegistry,
    dppReview: caseData.dppReview,
    prosecutionAction: caseData.prosecutionAction,
    courtRegistry: caseData.courtRegistry,
    court: caseData.court,
    correctional: caseData.correctional,
    paroleReleaseRecord: caseData.paroleReleaseRecord,
    rejectionInfo: caseData.rejectionInfo,
    policeSections: {
      sectionA: safeSectionA,
    },
  } as CaseData
}

function cloneCaseData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function stripCaseProofFields<T extends Record<string, any>>(caseData: T): T {
  const copy = cloneCaseData(caseData)
  delete copy.chainAnchor
  delete copy.blockchainHistory
  delete copy.blockchainStatus
  return copy
}

function buildAnchorRecord(action: string, result: any): BlockchainAnchorRecord {
  const transactionId = String(result?.transactionId || result?.txHash || "")
  return {
    transactionId,
    txHash: transactionId,
    blockNumber:
      result?.blockNumber === null || result?.blockNumber === undefined
        ? null
        : Number(result.blockNumber),
    contentHash: String(result?.contentHash || ""),
    channelName: result?.channelName ? String(result.channelName) : undefined,
    chaincodeName: result?.chaincodeName ? String(result.chaincodeName) : undefined,
    anchoredAt: new Date().toISOString(),
    action,
    warning: result?.warning ? String(result.warning) : null,
  }
}

function queueBlockchainAnchor(caseId: string, action: string) {
  if (typeof window === "undefined" || typeof fetch !== "function") return

  const currentCase = useStore.getState().cases.find((item) => item.caseId === caseId)
  if (!currentCase) return

  const anchorPayload = stripCaseProofFields(currentCase as Record<string, any>)
  const anchorVersion = String(currentCase.updatedAt || "")

  useStore.setState((state) => ({
    cases: state.cases.map((item) =>
      item.caseId === caseId
        ? {
            ...item,
            blockchainStatus: {
              ...((item as any).blockchainStatus ?? {}),
              pending: true,
              lastAction: action,
              error: null,
            },
          }
        : item
    ),
  }))

  void fetch("/api/blockchain/anchor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recordId: caseId,
      caseData: anchorPayload,
      action,
    }),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Blockchain anchor failed")
      }

      const anchor = buildAnchorRecord(action, data)

      useStore.setState((state) => ({
        cases: state.cases.map((item) => {
          if (item.caseId !== caseId) return item
          if (String(item.updatedAt || "") !== anchorVersion) return item

          const history = Array.isArray((item as any).blockchainHistory)
            ? (item as any).blockchainHistory
            : []

          return {
            ...item,
            chainAnchor: {
              transactionId: anchor.transactionId,
              txHash: anchor.txHash,
              blockNumber: anchor.blockNumber,
              contentHash: anchor.contentHash,
              channelName: anchor.channelName,
              chaincodeName: anchor.chaincodeName,
            },
            blockchainHistory: [anchor, ...history].slice(0, 25),
            blockchainStatus: {
              pending: false,
              lastAction: action,
              lastAnchoredAt: anchor.anchoredAt,
              warning: anchor.warning || null,
              error: null,
            },
          }
        }),
      }))
    })
    .catch((error: any) => {
      useStore.setState((state) => ({
        cases: state.cases.map((item) =>
          item.caseId === caseId
            ? {
                ...item,
                blockchainStatus: {
                  ...((item as any).blockchainStatus ?? {}),
                  pending: false,
                  lastAction: action,
                  error: error?.message || "Blockchain anchor failed",
                },
              }
            : item
        ),
      }))
    })
}

function sanitizePersistedActivity(activity: CaseActivity) {
  return {
    id: activity.id,
    caseId: activity.caseId,
    type: activity.type,
    actorName: activity.actorName,
    actorRole: activity.actorRole,
    message: activity.message,
    createdAt: activity.createdAt,
    metadata: activity.metadata,
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isHydrated: false,
      users: [],
      cases: [],
      caseActivities: [],
      courtStatisticsForms: [],

      setCurrentUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: !!user,
        }),

      setHydrated: (value) => set({ isHydrated: value }),

      logout: () => {
        try {
          ;(useStore as any).persist?.clearStorage?.()
          localStorage.removeItem("bejas-store")
          localStorage.removeItem("bejas-store-v3")
          localStorage.removeItem("zustand")
        } catch {}

        set({
          currentUser: null,
          isAuthenticated: false,
          isHydrated: true,
        })
      },

      getUsers: () => get().users,
      getUsersByRole: (role) =>
        get().users.filter(
          (user) => String(user.role || "").toLowerCase() === String(role || "").toLowerCase()
        ),

      getAllCases: () => get().cases,

      getCaseById: (caseId) => get().cases.find((c) => c.caseId === caseId),

      getCaseActivities: (caseId) => {
        const activities = get().caseActivities
        if (!caseId) return activities
        return activities.filter((item) => item.caseId === caseId)
      },

      appendCaseActivity: (activity) =>
        set((state) => ({
          caseActivities: [
            {
              ...activity,
              id: makeActivityId(),
              createdAt: new Date().toISOString(),
            },
            ...state.caseActivities,
          ],
        })),

      addPublicSubmission: (caseId, input) =>
        set((state) => {
          const caseExists = state.cases.some((c) => c.caseId === caseId)
          if (!caseExists) return state

          const message = String(input.message || "").trim()
          if (!message) return state

          const actorName = String(input.submitterName || "").trim() || "Public User"

          return {
            caseActivities: [
              {
                id: makeActivityId(),
                caseId,
                type: publicSubmissionToActivityType(input.type),
                actorName,
                actorRole: "public",
                message,
                createdAt: new Date().toISOString(),
                metadata: {
                  source: "public_portal",
                  submissionType: input.type,
                },
              },
              ...state.caseActivities,
            ],
          }
        }),

      submitCourtStatisticsForm: (payload) => {
        const currentUser = get().currentUser
        if (!currentUser) return null

        const record: CourtStatisticsFormRecord = {
          id: makeId("court-stats"),
          submittedAt: new Date().toISOString(),
          submittedById: currentUser.id,
          submittedByName: currentUser.name || currentUser.fullName || "Court Registry User",
          forwardedToRole: "high_court_registry_assistant",
          status: "sent_to_assistant",
          ...payload,
        }

        set((state) => ({
          courtStatisticsForms: [record, ...state.courtStatisticsForms],
        }))

        return record
      },

      getCourtStatisticsForms: () => get().courtStatisticsForms,

      markCourtStatisticsFormReceived: (id) =>
        set((state) => ({
          courtStatisticsForms: state.courtStatisticsForms.map((item) =>
            item.id === id ? { ...item, status: "received_by_assistant" } : item
          ),
        })),

      setCases: (cases) =>
        set({
          cases: Array.isArray(cases) ? cases : [],
        }),

      addCase: (caseData) => {
        set((state) => ({
          cases: [caseData, ...state.cases],
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId: caseData.caseId,
            type: "case_opened",
            actorName: caseData.policeOfficerName || "Opening officer",
            actorRole: "internal",
            message: "Case was opened and recorded.",
          }),
        }))
        queueBlockchainAnchor(caseData.caseId, "LOCAL_CASE_ADDED")
      },

      createCase: (caseData) => {
        const now = new Date().toISOString()
        const created = {
          ...(caseData as CaseData),
          caseId: makeId("case"),
          status: "draft_police",
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          cases: [created, ...state.cases],
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId: created.caseId,
            type: "case_opened",
            actorName: created.policeOfficerName || "Opening officer",
            actorRole: "internal",
            message: "Case was opened and recorded.",
          }),
        }))

        queueBlockchainAnchor(created.caseId, "LOCAL_CASE_CREATED")

        return created
      },

      updateCase: (caseId, patch) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.caseId === caseId
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
        queueBlockchainAnchor(caseId, "LOCAL_CASE_UPDATED")
      },

      submitToInvestigation: (caseId, submittedBy) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "pending_investigation",
              updatedAt,
              policeSections: {
                ...c.policeSections,
                sectionA: {
                  ...c.policeSections?.sectionA,
                  submittedToInvestigationAt: updatedAt,
                  submittedToInvestigationById: submittedBy?.id,
                  submittedToInvestigationByName:
                    submittedBy?.name ?? submittedBy?.fullName,
                },
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "submitted_to_investigation",
            actorName: actorDisplayName(submittedBy, "Police officer"),
            actorRole: "internal",
            message: "Case submitted to investigation.",
          }),
        }))
        queueBlockchainAnchor(caseId, "SUBMITTED_TO_INVESTIGATION")
      },

      startInvestigation: (caseId, investigator) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()
            const sectionA = c.policeSections?.sectionA ?? {}
            const sectionB = c.policeSections?.sectionB ?? {}

            return {
              ...c,
              status: "in_investigation",
              updatedAt,
              policeSections: {
                ...c.policeSections,
                sectionB: {
                  ...sectionB,
                  investigationStartedAt: updatedAt,
                  investigatorId: investigator?.id,
                  investigatorName: investigator?.name ?? investigator?.fullName,
                  // Ensure "continue investigation" has a locked base record.
                  initialCapture:
                    sectionB.initialCapture ??
                    {
                      incidentSummary:
                        sectionA.summary || sectionA.modusOperandi || "",
                      incidentDescription:
                        sectionA.complainantStatement || "",
                      modusOperandi: sectionA.modusOperandi || "",
                      dateOfOffence: sectionA.whenFromDate || "",
                      timeOfOffence: sectionA.whenFromTime || "",
                      placeOfOffence:
                        sectionA.whereCommittedSpecify || sectionA.whereCommitted || "",
                      district: c.district || "",
                      villageTownArea: "",
                      exactSceneDescription: "",
                      sceneVisited: "",
                      sceneVisitDate: "",
                      sceneVisitTime: "",
                      personsOfInterest: [],
                      propertyExhibits: [],
                      investigationStartDate: updatedAt,
                      investigatingOfficerName:
                        investigator?.name ?? investigator?.fullName ?? "",
                      investigatingOfficerNumber:
                        investigator?.badge ??
                        investigator?.badgeNumber ??
                        "",
                      policeStationDepartment:
                        investigator?.station ?? investigator?.department ?? "",
                      assignedUnit: investigator?.department ?? "Investigation",
                      currentStatus: "in_investigation",
                      currentPhase: "investigation",
                      savedAt: updatedAt,
                      savedById: investigator?.id,
                      savedByName: investigator?.name ?? investigator?.fullName ?? "",
                    },
                },
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "investigation_started",
            actorName: actorDisplayName(investigator, "Investigation unit"),
            actorRole: "internal",
            message: "Investigation started.",
          }),
        }))
        queueBlockchainAnchor(caseId, "INVESTIGATION_STARTED")
      },

      submitToCommissioner: (caseId, investigator, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "pending_commissioner",
              updatedAt,
              policeSections: {
                ...c.policeSections,
                sectionC: {
                  ...(c.policeSections?.sectionC ?? {}),
                  submittedToCommissionerAt: updatedAt,
                  submittedToCommissionerById: investigator?.id,
                  submittedToCommissionerByName:
                    investigator?.name ?? investigator?.fullName,
                  recommendedAction: notes || c.policeSections?.sectionC?.recommendedAction,
                },
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "submitted_to_commissioner",
            actorName: actorDisplayName(investigator, "Investigation unit"),
            actorRole: "internal",
            message: notes?.trim() || "Case submitted for commissioner review.",
          }),
        }))
        queueBlockchainAnchor(caseId, "SUBMITTED_TO_COMMISSIONER")
      },

      commissionerApproveCase: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "submitted_to_dpp",
              updatedAt,
              commissionerDecision: {
                decision: "approved",
                notes: notes || "",
                byId: user?.id,
                byName: user?.name ?? user?.fullName,
                at: updatedAt,
              },
              dppReview: {
                ...(c.dppReview ?? {}),
                forwardedAt: updatedAt,
                forwardedById: user?.id,
                forwardedByName: user?.name ?? user?.fullName,
              },
            }
          }),
          caseActivities: prependCaseActivity(
            prependCaseActivity(state.caseActivities, {
              caseId,
              type: "delivered_to_dpp",
              actorName: actorDisplayName(user, "Commissioner"),
              actorRole: "internal",
              message: "Case delivered to the DPP pipeline.",
            }),
            {
              caseId,
              type: "commissioner_approved",
              actorName: actorDisplayName(user, "Commissioner"),
              actorRole: "internal",
              message: notes?.trim() || "Commissioner approved this case.",
            }
          ),
        }))
        queueBlockchainAnchor(caseId, "COMMISSIONER_APPROVED_CASE")
      },

      commissionerRejectCase: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "rejected",
              updatedAt,
              commissionerDecision: {
                decision: "rejected",
                notes: notes || "",
                byId: user?.id,
                byName: user?.name ?? user?.fullName,
                at: updatedAt,
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "commissioner_rejected",
            actorName: actorDisplayName(user, "Commissioner"),
            actorRole: "internal",
            message: notes?.trim() || "Commissioner rejected this case.",
          }),
        }))
        queueBlockchainAnchor(caseId, "COMMISSIONER_REJECTED_CASE")
      },

      commissionerRequestClarification: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()
            const clarificationStatement = String(notes || "").trim()
            const previous = ((c.policeSections?.sectionC as any)?.clarificationRequests ?? []) as any[]
            const targetInvestigatorId = String(
              (c.policeSections?.sectionC as any)?.submittedToCommissionerById ||
              (c.policeSections?.sectionB as any)?.investigatorId ||
              ""
            ).trim()
            const targetInvestigatorName = String(
              (c.policeSections?.sectionC as any)?.submittedToCommissionerByName ||
              (c.policeSections?.sectionB as any)?.investigatorName ||
              ""
            ).trim()

            return {
              ...c,
              status: "commissioner_clarification",
              updatedAt,
              commissionerDecision: {
                decision: "clarification",
                // Keep public-facing commissioner note generic; detailed statement is internal only.
                notes: "Clarification requested by commissioner.",
                byId: user?.id,
                byName: user?.name ?? user?.fullName,
                at: updatedAt,
              },
              policeSections: {
                ...c.policeSections,
                sectionC: {
                  ...(c.policeSections?.sectionC ?? {}),
                  clarificationRequests: [
                    {
                      id: `clar-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                      statement: clarificationStatement,
                      requestedAt: updatedAt,
                      requestedById: user?.id,
                      requestedByName: user?.name ?? user?.fullName,
                      requestedByRole: user?.role ?? "police_commissioner",
                      targetInvestigatorId,
                      targetInvestigatorName,
                      status: "open",
                    },
                    ...previous,
                  ],
                  latestClarificationStatement: clarificationStatement,
                  latestClarificationAt: updatedAt,
                  latestClarificationByName: user?.name ?? user?.fullName,
                  latestClarificationTargetInvestigatorId: targetInvestigatorId,
                  latestClarificationTargetInvestigatorName: targetInvestigatorName,
                },
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "commissioner_clarification",
            actorName: actorDisplayName(user, "Commissioner"),
            actorRole: "internal",
            message: String(notes || "").trim() || "Commissioner requested clarification.",
          }),
        }))
        queueBlockchainAnchor(caseId, "COMMISSIONER_REQUESTED_CLARIFICATION")
      },

      dppRegisterCase: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "dpp_registry_intake",
              updatedAt,
              dppReview: {
                ...(c.dppReview ?? {}),
                registeredAt: updatedAt,
                registeredById: user?.id,
                registeredByName: user?.name ?? user?.fullName,
                registryNotes: notes || "",
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "dpp_registered",
            actorName: actorDisplayName(user, "DPP registry"),
            actorRole: "internal",
            message: notes?.trim() || "Case registered by the DPP office.",
          }),
        }))
        queueBlockchainAnchor(caseId, "DPP_REGISTERED_CASE")
      },

      dppAssignToProsecutor: (caseId, user, prosecutor) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "assigned_to_prosecutor",
              updatedAt,
              dppReview: {
                ...(c.dppReview ?? {}),
                assignedAt: updatedAt,
                assignedById: user?.id,
                assignedByName: user?.name ?? user?.fullName,
                assignedProsecutorId: prosecutor?.id ?? null,
                assignedProsecutorName:
                  prosecutor?.name ?? prosecutor?.fullName ?? "DPP Prosecutor Queue",
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "prosecutor_assigned",
            actorName: actorDisplayName(user, "DPP registry"),
            actorRole: "internal",
            message: `Case sent to ${actorDisplayName(prosecutor, "DPP Prosecutor Queue")}.`,
          }),
        }))
        queueBlockchainAnchor(caseId, "DPP_ASSIGNED_TO_PROSECUTOR")
      },

      dppReturnToPolice: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "returned_to_police",
              updatedAt,
              dppReview: {
                ...(c.dppReview ?? {}),
                returnedAt: updatedAt,
                returnedById: user?.id,
                returnedByName: user?.name ?? user?.fullName,
                returnReason: notes || "",
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "returned_to_police",
            actorName: actorDisplayName(user, "DPP office"),
            actorRole: "internal",
            message: notes?.trim() || "Case returned to police.",
          }),
        }))
        queueBlockchainAnchor(caseId, "DPP_RETURNED_TO_POLICE")
      },

      prosecutorFileToCourtRegistry: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "filed_to_high_court",
              updatedAt,
              court: {
                ...(c.court ?? {}),
                courtType: "high",
              },
              prosecutionAction: {
                filedAt: updatedAt,
                filedById: user?.id,
                filedByName: user?.name ?? user?.fullName,
                filingNotes: notes || "Filed to court registry after prosecutor review.",
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "delivered_to_court",
            actorName: actorDisplayName(user, "Prosecutor"),
            actorRole: "internal",
            message: notes?.trim() || "Case filed to court registry.",
          }),
        }))
        queueBlockchainAnchor(caseId, "PROSECUTOR_FILED_TO_COURT")
      },

      prosecutorReturnToPolice: (caseId, user, notes) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "returned_to_police",
              updatedAt,
              prosecutionAction: {
                returnedAt: updatedAt,
                returnedById: user?.id,
                returnedByName: user?.name ?? user?.fullName,
                returnReason: notes || "",
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "returned_to_police",
            actorName: actorDisplayName(user, "Prosecutor"),
            actorRole: "internal",
            message: notes?.trim() || "Case returned to police.",
          }),
        }))
        queueBlockchainAnchor(caseId, "PROSECUTOR_RETURNED_TO_POLICE")
      },

      highCourtRegistryIntake: (caseId, user, courtCaseNumber, notes, intakeFormData) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "high_court_registry_intake",
              updatedAt,
              court: {
                ...(c.court ?? {}),
                courtType: "high",
                courtCaseNumber: courtCaseNumber || c.court?.courtCaseNumber,
              },
              courtRegistry: {
                ...(c.courtRegistry ?? {}),
                intakeAt: updatedAt,
                intakeById: user?.id,
                intakeByName: user?.name ?? user?.fullName,
                intakeNotes: notes || "",
                intakeFormData: intakeFormData ?? c.courtRegistry?.intakeFormData ?? {},
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "court_registry_intake",
            actorName: actorDisplayName(user, "Court registry"),
            actorRole: "internal",
            message: notes?.trim() || "Court registry intake completed.",
          }),
        }))
        queueBlockchainAnchor(caseId, "HIGH_COURT_REGISTRY_INTAKE")
      },

      highCourtAssignJudge: (caseId, judge, clerk) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            const updatedAt = new Date().toISOString()

            return {
              ...c,
              status: "assigned_to_high_court_judge",
              updatedAt,
              court: {
                ...(c.court ?? {}),
                courtType: "high",
                assignedJudgeId: judge?.id,
                assignedJudgeName: judge?.name ?? judge?.fullName,
              },
              courtRegistry: {
                ...(c.courtRegistry ?? {}),
                assignedJudgeId: judge?.id,
                assignedJudgeName: judge?.name ?? judge?.fullName,
                assignedClerkId: clerk?.id,
                assignedClerkName: clerk?.name ?? clerk?.fullName,
                assignedAt: updatedAt,
              },
            }
          }),
          caseActivities: prependCaseActivity(state.caseActivities, {
            caseId,
            type: "judge_assigned",
            actorName: actorDisplayName(judge, "Court registry"),
            actorRole: "internal",
            message: `Case assigned to judge ${actorDisplayName(judge, "Unknown judge")}.`,
          }),
        }))
        queueBlockchainAnchor(caseId, "HIGH_COURT_ASSIGNED_JUDGE")
      },

      assignClerkToCase: (caseId, clerk) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.caseId !== caseId) {
              return c
            }

            return {
              ...c,
              updatedAt: new Date().toISOString(),
              courtRegistry: {
                ...(c.courtRegistry ?? {}),
                assignedClerkId: clerk?.id,
                assignedClerkName: clerk?.name ?? clerk?.fullName,
              },
            }
          }),
        }))
        queueBlockchainAnchor(caseId, "COURT_CLERK_ASSIGNED")
      },
    }),
    {
      name: "bejas-store-v3",
      version: 8,
      partialize: (state) => ({
        cases: state.cases.map(sanitizePersistedCase),
        caseActivities: state.caseActivities.slice(0, 250).map(sanitizePersistedActivity),
        courtStatisticsForms: state.courtStatisticsForms,
        users: state.users,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        isHydrated: state.isHydrated,
      }),
      migrate: (persisted: any, version: number) => {
        if (version < 4) {
          return {
            cases: Array.isArray(persisted?.cases) ? persisted.cases : [],
            caseActivities: Array.isArray(persisted?.caseActivities) ? persisted.caseActivities : [],
            courtStatisticsForms: Array.isArray(persisted?.courtStatisticsForms) ? persisted.courtStatisticsForms : [],
            users: Array.isArray(persisted?.users) ? persisted.users : [],
            currentUser: persisted?.currentUser ?? null,
            isAuthenticated: !!persisted?.currentUser,
            isHydrated: true,
          }
        }

        if (version < 7) {
          return {
            cases: [],
            caseActivities: [],
            courtStatisticsForms: [],
            users: Array.isArray(persisted?.users) ? persisted.users : [],
            currentUser: persisted?.currentUser ?? null,
            isAuthenticated: !!persisted?.currentUser,
            isHydrated: true,
          }
        }

        if (version < 8) {
          return {
            cases: Array.isArray(persisted?.cases) ? persisted.cases.map(sanitizePersistedCase) : [],
            caseActivities: Array.isArray(persisted?.caseActivities)
              ? persisted.caseActivities.slice(0, 250).map(sanitizePersistedActivity)
              : [],
            courtStatisticsForms: Array.isArray(persisted?.courtStatisticsForms) ? persisted.courtStatisticsForms : [],
            users: Array.isArray(persisted?.users) ? persisted.users : [],
            currentUser: persisted?.currentUser ?? null,
            isAuthenticated: !!persisted?.isAuthenticated,
            isHydrated: true,
          }
        }

        return {
          cases: Array.isArray(persisted?.cases) ? persisted.cases.map(sanitizePersistedCase) : [],
          caseActivities: Array.isArray(persisted?.caseActivities)
            ? persisted.caseActivities.slice(0, 250).map(sanitizePersistedActivity)
            : [],
          courtStatisticsForms: Array.isArray(persisted?.courtStatisticsForms) ? persisted.courtStatisticsForms : [],
          users: Array.isArray(persisted?.users) ? persisted.users : [],
          currentUser: persisted?.currentUser ?? null,
          isAuthenticated: !!persisted?.isAuthenticated,
          isHydrated: true,
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
