import { NextRequest, NextResponse } from "next/server"

import { buildOpenDataSnapshot } from "@/lib/server/public-portal"

function toCsv(rows: Record<string, any>[]) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ]
  return lines.join("\n")
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const format = String(url.searchParams.get("format") || "json").trim().toLowerCase()
    const dataset = String(url.searchParams.get("dataset") || "public-cases").trim().toLowerCase()
    const snapshot = await buildOpenDataSnapshot()

    const selectedRows =
      dataset === "departments"
        ? snapshot.byDepartment
        : dataset === "statuses"
          ? snapshot.byStatus
          : dataset === "phases"
            ? snapshot.byPhase
            : snapshot.publicCases

    if (format === "csv") {
      return new NextResponse(toCsv(selectedRows as Record<string, any>[]), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bejas-${dataset}.csv"`,
        },
      })
    }

    return NextResponse.json({ ok: true, snapshot, dataset: selectedRows })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to build open data." }, { status: 500 })
  }
}
