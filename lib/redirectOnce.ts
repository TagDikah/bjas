export function shouldRedirectOnce(key: string) {
  if (typeof window === "undefined") return true
  const k = "__redir__" + key
  if ((window as any)[k]) return false
  ;(window as any)[k] = true
  return true
}
