import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest, isAdminRole } from "@/lib/server/auth-session"
import { seedSesothoCases } from "@/lib/server/cases"

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const count = Number(body?.count || 60)

    const result = await seedSesothoCases({
      count: Number.isFinite(count) ? count : 60,
      actor: sessionUser,
    })

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.shortMessage || error?.message || "Failed to seed cases.",
      },
      { status: 500 }
    )
  }
}

