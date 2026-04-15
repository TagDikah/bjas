import { getLatestCaseHash } from "./lib/blockchain/case-anchor.ts"

async function main() {
  const hash = await getLatestCaseHash("CASE-001")
  console.log("Latest CASE-001 hash:", hash)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
