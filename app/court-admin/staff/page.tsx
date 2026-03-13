"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Scale, UserPlus, Eye, Mail, Gavel, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import type { User } from "@/lib/blockchain"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CourtStaffList() {
  const router = useRouter()
  const store = useStore() as any
  const users = (store.users ?? store.getUsers?.() ?? []) as User[];
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Court staff only (based on your actual roles)
  const staff = useMemo(() => {
    return users.filter(
      (u: User) =>
        u.role === "judge" ||
        u.role === "court_registry" ||
        u.role === "clerk" ||
        u.role === "court_admin"
    )
  }, [users])

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return staff

    return staff.filter((user: User) => {
      return (
        (user.name ?? "").toLowerCase().includes(q) ||
        (user.email ?? "").toLowerCase().includes(q) ||
        (user.badge ?? "").toLowerCase().includes(q) ||
        (user.court ?? "").toLowerCase().includes(q) ||
        (user.department ?? "").toLowerCase().includes(q)
      )
    })
  }, [staff, searchQuery])

  const getRoleIcon = (role: User["role"]) => {
    switch (role) {
      case "judge":
        return <Gavel className="h-4 w-4 text-primary" />
      case "clerk":
        return <FileText className="h-4 w-4 text-primary" />
      default:
        return <Scale className="h-4 w-4 text-primary" />
    }
  }

  const getRoleLabel = (role: User["role"]) => {
    switch (role) {
      case "judge":
        return "Judge"
      case "clerk":
        return "Clerk"
      case "court_registry":
        return "Registry"
      case "court_admin":
        return "Court Admin"
      default:
        return role
    }
  }

  const getBadgeVariant = (role: User["role"]) => {
    if (role === "judge") return "default"
    if (role === "court_registry") return "secondary"
    return "outline"
  }

  return (
    <DashboardLayout allowedRoles={["court_admin"]} title="Staff Management">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Court Staff Directory</h1>
            <p className="text-muted-foreground">
              Manage all registered judges, registry staff, and clerks
            </p>
          </div>

          <Button onClick={() => router.push("/court-admin/register")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register New Staff
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-foreground">All Staff Members</CardTitle>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, badge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-input border-border"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No staff members found</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/court-admin/register")}
                >
                  Register First Staff Member
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Employee ID</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Court</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredStaff.map((user: User) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-foreground font-mono text-sm">
                          {user.badge || "N/A"}
                        </TableCell>

                        <TableCell>
                          <Badge variant={getBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-foreground">
                          {user.court ?? user.department ?? "N/A"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={user.isActive ? "outline" : "secondary"}
                            className={user.isActive ? "border-primary/50 text-primary" : ""}
                          >
                            {user.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Staff Details</DialogTitle>
            <DialogDescription>View detailed information about this staff member</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  {selectedUser.role === "judge" ? (
                    <Gavel className="h-8 w-8 text-primary" />
                  ) : selectedUser.role === "clerk" ? (
                    <FileText className="h-8 w-8 text-primary" />
                  ) : (
                    <Scale className="h-8 w-8 text-primary" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                  <Badge variant={getBadgeVariant(selectedUser.role)}>
                    {getRoleLabel(selectedUser.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {selectedUser.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-mono text-foreground">{selectedUser.badge || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Court</p>
                  <p className="text-foreground">{selectedUser.court ?? "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-foreground">{selectedUser.department ?? "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-foreground">{selectedUser.isActive ? "Active" : "Disabled"}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                <p className="font-mono text-xs text-foreground break-all bg-secondary p-2 rounded">
                  {selectedUser.publicKey}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}



