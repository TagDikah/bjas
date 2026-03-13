import { getRoleRoute } from "./role-routes"

export function redirectForRole(role?: string | null) {
  return getRoleRoute(role)
}

export function redirectByRole(role?: string | null) {
  return getRoleRoute(role)
}