import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { toCanonicalRole } from "@/lib/roles"

export type SessionUser = {
  id: string
  email: string
  role: string
  name?: string | null
  fullname?: string | null
  department?: string | null
  station?: string | null
  badge?: string | null
}

function parseSessionValue(value?: string | null): SessionUser | null {
  // Presentation note: this decodes the login cookie and turns it into the current signed-in user object.
  if (!value) return null

  try {
    const json = Buffer.from(value, "base64url").toString("utf8")
    const parsed = JSON.parse(json)

    if (!parsed?.id || !parsed?.email) {
      return null
    }

    return {
      ...parsed,
      role: toCanonicalRole(parsed.role),
    }
  } catch {
    return null
  }
}

export function getSessionUserFromRequest(request: NextRequest) {
  // Presentation note: API routes call this to protect endpoints and know who is performing each action.
  return parseSessionValue(request.cookies.get("auth-token")?.value)
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies()
  return parseSessionValue(cookieStore.get("auth-token")?.value)
}

export function isAdminRole(role?: string | null) {
  const canonical = toCanonicalRole(role)
  return canonical === "admin" ||
    canonical === "police_admin" ||
    canonical === "court_admin" ||
    canonical === "dpp_admin"
}
