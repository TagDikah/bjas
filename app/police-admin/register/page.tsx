"use client";

import React from "react"

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useStore } from "/@/lib/store";
import type { User } from "/@/lib/blockchain";import { Shield, Lock, Key, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PoliceStaffRegistration() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as User["role"] | "",
    badgeNumber: "",
    department: "",
    rank: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    nationalId: "",
    emergencyContact: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setGeneratedKeys(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      return;
    }

    if (formData.role !== "police_officer" && formData.role !== "commissioner") {
      setError("Invalid role for police department");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        badgeNumber: formData.badgeNumber,
        department: formData.department,
        metadata: {
          rank: formData.rank,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          nationalId: formData.nationalId,
          emergencyContact: formData.emergencyContact,
          notes: formData.notes,
        },
      });

      setGeneratedKeys({
        publicKey: result.user.publicKey,
        privateKey: result.privateKey,
      });
      setSuccess(true);

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        badgeNumber: "",
        department: "",
        rank: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: "",
        nationalId: "",
        emergencyContact: "",
        notes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="police_admin" title="Register Staff">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register Police Staff</h1>
          <p className="text-muted-foreground">
            Add new police officers or commissioners to the BEJAS system
          </p>
        </div>

        {success && generatedKeys && (
          <Alert className="border-primary bg-primary/10">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Registration Successful!</AlertTitle>
            <AlertDescription className="text-foreground">
              <p className="mb-3">
                The staff member has been registered. Please save the following keys securely:
              </p>
              <div className="flex flex-col gap-2 p-3 bg-secondary rounded-lg font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">Public Key:</span>
                  <p className="break-all">{generatedKeys.publicKey}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Private Key (KEEP SECRET):</span>
                  <p className="break-all text-destructive">{generatedKeys.privateKey}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                The private key will be used for blockchain transactions and should be stored
                securely by the staff member.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>Personal details and account credentials</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@police.gov.ls"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create password"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as User["role"] })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="police_officer">Police Officer</SelectItem>
                      <SelectItem value="commissioner">Police Commissioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="National ID number"
                    required
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Key className="h-5 w-5 text-primary" />
                  Police Department Details
                </CardTitle>
                <CardDescription>Badge number, department, and rank information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="badgeNumber">Badge Number *</Label>
                  <Input
                    id="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="e.g., LMPD-2024-001"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criminal_investigation">Criminal Investigation</SelectItem>
                      <SelectItem value="traffic">Traffic Department</SelectItem>
                      <SelectItem value="patrol">Patrol Division</SelectItem>
                      <SelectItem value="special_operations">Special Operations</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="community_policing">Community Policing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rank">Rank *</Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => setFormData({ ...formData, rank: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="constable">Constable</SelectItem>
                      <SelectItem value="sergeant">Sergeant</SelectItem>
                      <SelectItem value="inspector">Inspector</SelectItem>
                      <SelectItem value="superintendent">Superintendent</SelectItem>
                      <SelectItem value="senior_superintendent">Senior Superintendent</SelectItem>
                      <SelectItem value="assistant_commissioner">Assistant Commissioner</SelectItem>
                      <SelectItem value="deputy_commissioner">Deputy Commissioner</SelectItem>
                      <SelectItem value="commissioner">Commissioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>Address and emergency contact details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+266 XXXX XXXX"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name and phone number"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="address">Physical Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information..."
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/police-admin/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Staff Member"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}



