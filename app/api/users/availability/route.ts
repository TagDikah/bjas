import { NextRequest, NextResponse } from "next/server"
import { listUsers } from "@/lib/server/users"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { toCanonicalRole } from "@/lib/roles"

const allowedViewerRoles = new Set([
  "admin",
  "court_admin",
  "high_court_registry",
  "high_court_registry_assistant",
  "registry",
])

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  const viewerRole = toCanonicalRole(sessionUser?.role)

  if (!sessionUser || !allowedViewerRoles.has(viewerRole)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  const url = new URL(request.url)
  const rolesRaw = String(url.searchParams.get("roles") || "high_court_judge,clerk")
  const roleSet = new Set(
    rolesRaw
      .split(",")
      .map((role) => toCanonicalRole(role))
      .filter(Boolean)
  )

  const users = await listUsers()
  const filtered = users
    .filter((user) => user.isActive)
    .filter((user) => roleSet.has(toCanonicalRole(user.role)))
    .map((user) => ({
      id: user.id,
      name: user.name || user.fullname || user.email,
      fullname: user.fullname || user.name || user.email,
      email: user.email,
      role: toCanonicalRole(user.role),
      station: user.station,
      department: user.department,
      badge: user.badge,
      isActive: user.isActive,
    }))

  return NextResponse.json({ ok: true, users: filtered })
}

