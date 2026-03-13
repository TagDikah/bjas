"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AdminPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]} title="Admin Dashboard">
      <div className="p-6">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">
          Welcome to the admin dashboard.
        </p>
      </div>
    </DashboardLayout>
  )
}
