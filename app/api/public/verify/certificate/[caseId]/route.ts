import { NextResponse } from "next/server"

import { getVerificationCertificateData } from "@/lib/server/public-portal"

function pdfText(value: string) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildSimplePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) =>
      index === 0
        ? [`(${pdfText(line)}) Tj`]
        : ["0 -24 Td", `(${pdfText(line)}) Tj`]
    ),
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
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, "utf8")
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params
    const certificate = await getVerificationCertificateData(caseId)
    if (!certificate) {
      return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 })
    }

    const pdf = buildSimplePdf([
      "BEJAS Public Verification Certificate",
      `Case Number: ${certificate.caseNumber}`,
      `Reference: ${certificate.caseId}`,
      `Charge: ${certificate.charge}`,
      `District: ${certificate.district}`,
      `Status: ${certificate.status}`,
      `Generated At: ${certificate.generatedAt}`,
      `Transaction Ref: ${certificate.transactionReference}`,
      `Integrity Hash: ${certificate.integrityHash}`,
    ])

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bejas-verification-${certificate.caseNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to generate certificate." }, { status: 500 })
  }
}
