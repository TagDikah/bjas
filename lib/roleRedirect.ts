import { getRoleRoute } from "./role-routes"

export function redirectForRole(role?: string | null) {
  return getRoleRoute(role)
}

export function roleRedirect(role?: string | null) {
  return getRoleRoute(role)
}