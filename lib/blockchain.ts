export interface User {
  id: string
  name: string
  fullName?: string
  email: string
  role: string
  station?: string
  department?: string
  badgeNumber?: string
  badge?: string
  publicKey?: string
  isActive?: boolean
  court?: string
  metadata?: Record<string, any>
  [key: string]: any
}

export interface CaseData {
  caseId: string
  caseNumber: string
  citation?: string
  district?: string
  parties?: string
  charge?: string
  description?: string
  evidence?: any[]
  policeOfficerId?: string
  policeOfficerName?: string
  policeStationId?: string
  status: string
  createdAt: string
  updatedAt: string
  policeSections?: {
    sectionA?: Record<string, any>
    [key: string]: any
  }
  [key: string]: any
}
