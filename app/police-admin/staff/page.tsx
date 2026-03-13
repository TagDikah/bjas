"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Shield, UserPlus, Eye, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore, type User } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PoliceStaffList() {
  const router = useRouter();
  const store = useStore() as any;
  const searchParams = useSearchParams();
  const [staff, setStaff] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const policeUsers = store.getUsers().filter(
      (u) => u.role === "police_officer" || u.role === "commissioner"
    );
    setStaff(policeUsers);
  }, []);

  const filteredStaff = staff.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.badgeNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="police_admin" title="Staff Management">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Police Staff Directory</h1>
            <p className="text-muted-foreground">
              Manage all registered police officers and commissioners
            </p>
          </div>
          <Button onClick={() => router.push("/police-admin/register")} className="gap-2">
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
                  placeholder="Search by name, email, or badge..."
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
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No staff members found</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/police-admin/register")}
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
                      <TableHead className="text-muted-foreground">Badge Number</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Department</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm">
                          {user.badgeNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "commissioner" ? "default" : "secondary"}>
                            {user.role === "commissioner" ? "Commissioner" : "Officer"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {user.department || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-primary/50 text-primary"
                          >
                            Active
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

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Staff Details</DialogTitle>
            <DialogDescription>
              View detailed information about this staff member
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedUser.fullName}</h3>
                  <Badge variant={selectedUser.role === "commissioner" ? "default" : "secondary"}>
                    {selectedUser.role === "commissioner" ? "Commissioner" : "Police Officer"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {selectedUser.email}
                </div>
                {selectedUser.metadata?.phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {selectedUser.metadata.phoneNumber}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Badge Number</p>
                  <p className="font-mono text-foreground">{selectedUser.badgeNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-foreground">{selectedUser.department || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rank</p>
                  <p className="text-foreground capitalize">
                    {selectedUser.metadata?.rank?.replace(/_/g, " ") || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">National ID</p>
                  <p className="text-foreground">{selectedUser.metadata?.nationalId || "N/A"}</p>
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
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PoliceStaffList />
    </Suspense>
  );
}





