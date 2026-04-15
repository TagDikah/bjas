import "server-only"

import { readRequiredEnv } from "@/lib/server/env"

export function assertFabricBridgeAuthorized(request: Request) {
  const expectedToken = readRequiredEnv("FABRIC_BRIDGE_TOKEN")
  const provided = request.headers.get("authorization") || ""

  if (provided !== `Bearer ${expectedToken}`) {
    throw new Error("Unauthorized Fabric bridge request.")
  }
}
