export type AppTheme = "current" | "white" | "navy"

export type UserPreferences = {
  theme: AppTheme
  profileImageDataUrl?: string
}

const DEFAULT_PREFS: UserPreferences = {
  theme: "current",
  profileImageDataUrl: "",
}

function prefsKey(userId?: string | null) {
  return `bejas:user-prefs:${String(userId || "guest")}`
}

export function applyThemePreference(theme: AppTheme) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  root.setAttribute("data-app-theme", theme)
  localStorage.setItem("bejas:last-theme", theme)

  if (theme === "current") {
    root.classList.add("dark")
    return
  }

  root.classList.remove("dark")
}

export function getUserPreferences(userId?: string | null): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS

  const raw = localStorage.getItem(prefsKey(userId))
  if (!raw) {
    const fallbackTheme = (localStorage.getItem("bejas:last-theme") as AppTheme | null) || "current"
    return { ...DEFAULT_PREFS, theme: fallbackTheme }
  }

  try {
    const parsed = JSON.parse(raw)
    const theme = (["current", "white", "navy"].includes(parsed?.theme) ? parsed.theme : "current") as AppTheme
    return {
      theme,
      profileImageDataUrl: String(parsed?.profileImageDataUrl || ""),
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function setUserPreferences(userId: string, prefs: UserPreferences) {
  if (typeof window === "undefined") return
  localStorage.setItem(prefsKey(userId), JSON.stringify(prefs))
  localStorage.setItem("bejas:last-theme", prefs.theme)
}
