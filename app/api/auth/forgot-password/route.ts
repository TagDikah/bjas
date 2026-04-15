import { NextResponse } from "next/server"
import { requestPasswordReset } from "@/lib/server/users"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await requestPasswordReset(body?.email)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to start password reset." },
      { status: 400 }
    )
  }
}
