"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Scale, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  fullname?: string
  name?: string
  email: string
  role: string
  badge?: string
  department?: string | null
  station?: string | null
  isActive?: boolean
}

export default function CourtStaffPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok) setUsers(data.users ?? [])
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((user) => ["court_admin", "registry", "judge", "clerk", "high_court_registry_assistant"].includes(user.role))
      .filter((user) => {
        if (!q) return true
        return [user.fullname, user.name, user.email, user.badge, user.department, user.station]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      })
  }, [query, users])

  return (
    <DashboardLayout allowedRoles={["court_admin", "admin"]} title="Court Staff Directory">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Court Staff Directory</h2>
            <p className="text-sm text-muted-foreground">All judiciary accounts stored in TiDB.</p>
          </div>
          <Button onClick={() => router.push("/court-admin/register")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{user.fullname || user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{user.badge || "No badge"}</div>
                    <div>{user.station || user.department || "No office"}</div>
                  </div>
                  <Badge variant={user.isActive ? "outline" : "secondary"}>
                    {user.role.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? <div className="text-sm text-muted-foreground">No court users found.</div> : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
