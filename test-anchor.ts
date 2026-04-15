import { anchorCaseOnChain } from "./lib/blockchain/case-anchor.ts"

async function main() {
  const result = await anchorCaseOnChain({
    recordId: "CASE-001",
    caseData: {
      caseId: "CASE-001",
      suspect: "Bokang Kobo",
      offence: "Fraud",
      status: "Archived"
    },
    action: "UPDATED"
  })

  console.log(result)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
