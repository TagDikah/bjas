import { NextRequest, NextResponse } from "next/server"

import { buildOpenDataSnapshot } from "@/lib/server/public-portal"

function pdfText(value: string) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildSimplePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 16 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) => (index === 0 ? [`(${pdfText(line)}) Tj`] : ["0 -20 Td", `(${pdfText(line)}) Tj`])),
    "ET",
  ].join("\n")

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ]

  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += `${obj}\n`
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < offsets.length; i += 1) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, "utf8")
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const pack = String(url.searchParams.get("pack") || "transparency").trim().toLowerCase()
    const snapshot = await buildOpenDataSnapshot()

    const lines =
      pack === "outcomes"
        ? [
            "BEJAS Outcomes Report Pack",
            `Generated: ${snapshot.generatedAt}`,
            `Visible cases: ${snapshot.totals.visibleCases}`,
            `Visible phases: ${snapshot.totals.phases}`,
            ...snapshot.byPhase.slice(0, 8).map((item) => `${item.phase}: ${item.count}`),
          ]
        : [
            "BEJAS Transparency Report Pack",
            `Generated: ${snapshot.generatedAt}`,
            `Visible cases: ${snapshot.totals.visibleCases}`,
            `Departments: ${snapshot.totals.departments}`,
            `Statuses: ${snapshot.totals.statuses}`,
            ...snapshot.byDepartment.slice(0, 8).map((item) => `${item.department}: ${item.count}`),
          ]

    const pdf = buildSimplePdf(lines)
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bejas-${pack}-report-pack.pdf"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to generate report pack." }, { status: 500 })
  }
}
