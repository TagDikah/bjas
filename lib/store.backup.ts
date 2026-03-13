"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CaseData, User } from "@/lib/blockchain"

interface StoreState {
  currentUser: User | null
  isAuthenticated: boolean
  cases: CaseData[]
  setCurrentUser: (user: User | null) => void
  logout: () => void
  getAllCases: () => CaseData[]
  getCaseById: (caseId: string) => CaseData | undefined
  addCase: (caseData: CaseData) => void
  updateCase: (caseId: string, patch: Partial<CaseData>) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      cases: [],

      setCurrentUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: !!user,
        }),

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
        })
      },

      getAllCases: () => get().cases,

      getCaseById: (caseId: string) => {
        return get().cases.find((c) => c.caseId === caseId)
      },

      addCase: (caseData) =>
        set((state) => ({
          cases: [caseData, ...state.cases],
        })),

      updateCase: (caseId, patch) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.caseId === caseId ? { ...c, ...patch } : c
          ),
        })),
    }),
    {
      name: "bejas-store-v3",
      version: 3, // ⬆️ bumped so old cache is migrated cleanly
      
      // ✅ NOW persists currentUser + isAuthenticated so role survives page load
      partialize: (state) => ({
        cases: state.cases,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),

      migrate: (persisted: any, version: number) => {
        // wipe old v2 cache that had no currentUser
        if (version < 3) {
          return {
            cases: Array.isArray(persisted?.cases) ? persisted.cases : [],
            currentUser: null,
            isAuthenticated: false,
          }
        }
        return {
          cases: Array.isArray(persisted?.cases) ? persisted.cases : [],
          currentUser: persisted?.currentUser ?? null,
          isAuthenticated: !!persisted?.isAuthenticated,
        }
      },
    }
  )
)