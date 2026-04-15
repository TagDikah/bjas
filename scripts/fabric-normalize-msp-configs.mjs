import fs from "node:fs"
import path from "node:path"

const rootDir = process.cwd()
const organizationsDir = path.join(rootDir, "fabric-crypto", "organizations")

function walk(dir, matches = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, matches)
      continue
    }

    if (entry.isFile() && entry.name === "config.yaml") {
      matches.push(fullPath)
    }
  }
  return matches
}

function normalizeConfigFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8")
  const updated = original.replace(/Certificate:\s+([^\r\n]+)/g, (_, value) => {
    return `Certificate: ${value.replace(/\\/g, "/")}`
  })

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8")
    return true
  }

  return false
}

if (!fs.existsSync(organizationsDir)) {
  console.error(`Fabric organizations directory not found: ${organizationsDir}`)
  process.exit(1)
}

const files = walk(organizationsDir)
let changed = 0

for (const filePath of files) {
  if (normalizeConfigFile(filePath)) {
    changed += 1
    console.log(`normalized ${path.relative(rootDir, filePath)}`)
  }
}

console.log(`checked ${files.length} MSP config files, normalized ${changed}`)
