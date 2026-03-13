import { NextResponse } from "next/server"
import { getDbPool } from "@/lib/db"

export async function GET() {
  try {
    const pool = await getDbPool()
    await pool.query("SELECT 1")
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DB health error:", error)
    return NextResponse.json(
      { ok: false, error: "Database connection failed" },
      { status: 500 }
    )
  }
}
