import { NextResponse } from "next/server"
import { resetPassword } from "@/lib/server/users"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await resetPassword(String(body?.token || ""), String(body?.password || ""))
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to reset password." },
      { status: 400 }
    )
  }
}
