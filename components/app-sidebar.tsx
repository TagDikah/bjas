"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Shield, 
  FileText, 
  Users, 
  Gavel, 
  ClipboardCheck,
  Building2,
  UserCog,
  LogOut,
  LayoutDashboard,
  Scale,
  Lock,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

const roleNavigations: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  police_officer: [
    { label: "Dashboard", href: "/police/dashboard", icon: LayoutDashboard },
    { label: "Open New Case", href: "/police/dashboardnew-case", icon: FileText },
    { label: "My Cases", href: "/police/cases", icon: ClipboardCheck },
  ],
  police_admin: [
    { label: "Dashboard", href: "/police-admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Staff", href: "/police-admin/staff", icon: Users },
    { label: "All Cases", href: "/police-admin/staff", icon: FileText },
  ],
  police_investigator: [
    { label: "Dashboard", href: "/investigation/dashboard", icon: LayoutDashboard },
    { label: "Investigation Queue", href: "/investigation/cases", icon: ClipboardCheck },
  ],
  police_commissioner: [
    { label: "Dashboard", href: "/commissioner/dashboard", icon: LayoutDashboard },
    { label: "Case Reviews", href: "/commissioner/cases", icon: ClipboardCheck },
    { label: "Approvals", href: "/commissioner/dashboardapprovals", icon: ClipboardCheck },
    { label: "Incident Dashboard", href: "/commissioner/dashboardincidents", icon: Scale },
    { label: "Audit Trail", href: "/commissioner/dashboardaudit", icon: Lock },
    { label: "Reports", href: "/commissioner/dashboardreports", icon: FileText },
  ],
  // Prosecution
  prosecution_registry: [
    { label: "Dashboard", href: "/prosecution-registry/dashboard", icon: LayoutDashboard },
    { label: "Register Cases", href: "/prosecution-registry/dashboardregister", icon: ClipboardCheck },
    { label: "All Cases", href: "/prosecution-registry/cases", icon: FileText },
  ],
  dpp: [
    { label: "Dashboard", href: "/dpp/dashboard", icon: LayoutDashboard },
    { label: "Review & Assign", href: "/dpp/dashboardreview", icon: ClipboardCheck },
    { label: "All Cases", href: "/dpp/cases", icon: FileText },
  ],
  prosecutor: [
    { label: "Dashboard", href: "/prosecutor/dashboard", icon: LayoutDashboard },
    { label: "Assigned Cases", href: "/prosecutor/cases", icon: FileText },
  ],

  // Small Court
  small_court_registry: [
    { label: "Dashboard", href: "/small-court-registry/dashboard", icon: LayoutDashboard },
    { label: "Intake Queue", href: "/small-court-registry/dashboardintake", icon: ClipboardCheck },
    { label: "All Cases", href: "/small-court-registry/cases", icon: FileText },
  ],
  small_court_judge: [
    { label: "Dashboard", href: "/small-court-judge/dashboard", icon: LayoutDashboard },
    { label: "My Cases", href: "/small-court-judge/cases", icon: Gavel },
  ],

  // High Court
  high_court_registry: [
    { label: "Dashboard", href: "/high-court-registry/dashboard", icon: LayoutDashboard },
    { label: "Intake Queue", href: "/high-court-registry/dashboardintake", icon: ClipboardCheck },
    { label: "All Cases", href: "/high-court-registry/cases", icon: FileText },
  ],
  high_court_registry_assistant: [
    { label: "Dashboard", href: "/high-court-registry/dashboardassistant/dashboard", icon: LayoutDashboard },
    { label: "AI Assignment", href: "/high-court-registry/dashboardassistant/assign", icon: Sparkles },
    { label: "All High Court Cases", href: "/high-court-registry/cases", icon: FileText },
  ],
  high_court_judge: [
    { label: "Dashboard", href: "/high-court-judge/dashboard", icon: LayoutDashboard },
    { label: "My Cases", href: "/high-court-judge/cases", icon: Gavel },
  ],

  // Legacy aliases (still supported)
  court_registry: [
    { label: "Dashboard", href: "/high-court-registry/dashboard", icon: LayoutDashboard },
    { label: "Intake Queue", href: "/high-court-registry/dashboardintake", icon: ClipboardCheck },
    { label: "All Cases", href: "/high-court-registry/cases", icon: FileText },
  ],
  judge: [
    { label: "Dashboard", href: "/high-court-judge/dashboard", icon: LayoutDashboard },
    { label: "My Cases", href: "/high-court-judge/cases", icon: Gavel },
  ],
  clerk: [
    { label: "Dashboard", href: "/clerk/dashboard", icon: LayoutDashboard },
    { label: "Assigned Cases", href: "/clerk/cases", icon: FileText },
    { label: "Session List", href: "/clerk/dashboardsessions", icon: ClipboardCheck },
  ],
  court_admin: [
    { label: "Dashboard", href: "/court-admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Staff", href: "/court-admin/staff", icon: Users },
    { label: "All Cases", href: "/court-admin/cases", icon: FileText },
  ],
}

const roleTitles: Record<string, { title: string; icon: React.ElementType }> = {
  police_officer: { title: "Police Officer", icon: Shield },
  police_admin: { title: "Police Admin", icon: UserCog },
  prosecution_registry: { title: "Prosecution Registry", icon: Building2 },
  dpp: { title: "DPP", icon: Scale },
  prosecutor: { title: "Prosecutor", icon: FileText },
  small_court_registry: { title: "Small Court Registry", icon: Building2 },
  small_court_judge: { title: "Small Court Judge", icon: Gavel },
  high_court_registry: { title: "High Court Registry", icon: Building2 },
  high_court_registry_assistant: { title: "High Court Registry Assistant", icon: Sparkles },
  high_court_judge: { title: "High Court Judge", icon: Gavel },
  // Legacy
  court_registry: { title: "High Court Registry", icon: Building2 },
  judge: { title: "High Court Judge", icon: Gavel },
  clerk: { title: "Court Clerk", icon: ClipboardCheck },
  court_admin: { title: "Court Admin", icon: UserCog },
}

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser, logout } = useStore()

  if (!currentUser) return null

  const navigation = roleNavigations[currentUser.role] || []
  const roleInfo = roleTitles[currentUser.role] || { title: "User", icon: Users }
  const RoleIcon = roleInfo.icon

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">BEJAS</h1>
            <p className="text-xs text-muted-foreground">Blockchain Judiciary</p>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <RoleIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{roleInfo.title}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive"
            onClick={() => {
              logout()
              window.location.href = "/"
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  )
}