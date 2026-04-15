import { NextRequest, NextResponse } from "next/server"
import { createUser, listUsers } from "@/lib/server/users"
import { getSessionUserFromRequest, isAdminRole } from "@/lib/server/auth-session"

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  const users = await listUsers()
  return NextResponse.json({ ok: true, users })
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const created = await createUser(
      {
        email: body.email,
        role: body.role,
        name: body.name,
        fullname: body.fullname,
        department: body.department,
        station: body.station,
        badge: body.badge,
        password: body.password,
        isActive: body.isActive,
        metadata: body.metadata,
      },
      sessionUser.id
    )

    return NextResponse.json({ ok: true, ...created })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create user." },
      { status: 400 }
    )
  }
}
