import fs from "node:fs"
import path from "node:path"

function normalizeValue(value: string | undefined | null) {
  const text = String(value || "").trim()
  return text ? text : undefined
}

function readFileValue(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/")
  const absolutePath = path.isAbsolute(normalized)
    ? normalized
    : path.resolve(process.cwd(), normalized)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Secret file not found: ${absolutePath}`)
  }

  return normalizeValue(fs.readFileSync(absolutePath, "utf8"))
}

export function readEnv(name: string, options?: { fileName?: string; fallback?: string }) {
  const directValue = normalizeValue(process.env[name])
  if (directValue) {
    return directValue
  }

  const fileName = options?.fileName ?? `${name}_FILE`
  const fileValue = normalizeValue(process.env[fileName])
  if (fileValue) {
    const resolved = readFileValue(fileValue)
    if (resolved) {
      return resolved
    }
  }

  return normalizeValue(options?.fallback)
}

export function readRequiredEnv(
  name: string,
  options?: { fileName?: string; fallback?: string }
) {
  const value = readEnv(name, options)
  if (!value) {
    const fileName = options?.fileName ?? `${name}_FILE`
    throw new Error(`Missing required env var: ${name} (or ${fileName})`)
  }
  return value
}

export function readPathEnv(
  name: string,
  options?: { fileName?: string; fallback?: string }
) {
  const value = readEnv(name, options)
  if (!value) {
    return undefined
  }

  const normalized = value.replace(/\\/g, "/")
  return path.isAbsolute(normalized) ? normalized : path.resolve(process.cwd(), normalized)
}

export function readRequiredPathEnv(
  name: string,
  options?: { fileName?: string; fallback?: string }
) {
  const resolvedPath = readPathEnv(name, options)
  if (!resolvedPath) {
    const fileName = options?.fileName ?? `${name}_FILE`
    throw new Error(`Missing required path env var: ${name} (or ${fileName})`)
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Required file path does not exist for ${name}: ${resolvedPath}`)
  }

  return resolvedPath
}

export function readFileText(pathValue: string) {
  return fs.readFileSync(pathValue, "utf8")
}
