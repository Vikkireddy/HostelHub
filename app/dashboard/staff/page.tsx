"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { fetchWithHostel } from "@/lib/ApiClient";
type StaffFormState = {
  name: string;
  phone: string;
  designation: string;
  monthly_salary: string;
  notes: string;
};

/** Matches GET /api/staff row shape */
type StaffMember = {
  id: number;
  name: string;
  phone: string;
  designation: string;
  monthly_salary: number;
  notes: string;
  is_active: boolean;
  created_at: string;
};

const initialStaffForm: StaffFormState = {
  name: "",
  phone: "",
  designation: "",
  monthly_salary: "",
  notes: "",
};

export default function StaffManagementPage() {
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canStaffAdd = hasDashboardPermission(user, "staff", "add");
  const canStaffDelete = hasDashboardPermission(user, "staff", "delete");
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StaffFormState>(initialStaffForm);

  const { data: staffMembers = [], isLoading, error } = useQuery<StaffMember[]>({
    queryKey: ["staff-members", hostelId],
    queryFn: () => fetchWithHostel("/api/staff", hostelId).then((r) => r.json()),
    enabled: Boolean(hostelId),
  });

  const createStaff = useMutation({
    mutationFn: async (data: StaffFormState) => {
      const res = await fetchWithHostel("/api/staff", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone.trim() || null,
          designation: data.designation.trim() || null,
          monthly_salary: Number(data.monthly_salary),
          notes: data.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Failed to add staff");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      setForm(initialStaffForm);
    },
  });

  const deactivateStaff = useMutation({
    mutationFn: async (staffId: number) => {
      const res = await fetchWithHostel(`/api/staff/${staffId}`, hostelId, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to remove staff");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  if (!hostelId) {
    return (
      <Box className="flex items-center justify-center p-16">
        <Typography variant="muted">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Add Staff Member</CardTitle>
          <CardDescription>
            Capture name, phone, role, and salary so salary expenses can be tracked accurately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canStaffAdd) return;
              if (!form.name.trim() || !form.monthly_salary) return;
              createStaff.mutate(form);
            }}
          >
            <Box className="space-y-2">
              <Label htmlFor="staff-name">Staff Name *</Label>
              <Input
                id="staff-name"
                value={form.name}
                disabled={!canStaffAdd}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Ramesh"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={form.phone}
                disabled={!canStaffAdd}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="staff-designation">Role / Designation</Label>
              <Input
                id="staff-designation"
                value={form.designation}
                disabled={!canStaffAdd}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="e.g. Warden"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="staff-salary">Monthly Salary (₹) *</Label>
              <Input
                id="staff-salary"
                type="number"
                min="0"
                step="0.01"
                value={form.monthly_salary}
                disabled={!canStaffAdd}
                onChange={(e) => setForm((p) => ({ ...p, monthly_salary: e.target.value }))}
                placeholder="e.g. 18000"
              />
            </Box>
            <Box className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-notes">Other Details</Label>
              <Input
                id="staff-notes"
                value={form.notes}
                disabled={!canStaffAdd}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Night shift, joined Jan 2026"
              />
            </Box>
            <Box className="md:col-span-2 flex items-center justify-end gap-3">
              {createStaff.error && (
                <Typography variant="error">
                  {createStaff.error.message}
                </Typography>
              )}
              <Button
                type="submit"
                disabled={!canStaffAdd || createStaff.isPending || !form.name || !form.monthly_salary}
                title={!canStaffAdd ? "You don't have permission to add staff" : undefined}
              >
                {createStaff.isPending ? "Saving..." : "Add Staff"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Staff List</CardTitle>
          <CardDescription>Active staff available for salary expense entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Typography variant="muted">Loading staff...</Typography>
          ) : error ? (
            <Typography variant="error">
              {error instanceof Error ? error.message : "Failed to load staff"}
            </Typography>
          ) : staffMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No staff added yet"
              message="Add staff members to link salary payouts to expenses."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.phone || "-"}</TableCell>
                    <TableCell>{staff.designation || "-"}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{staff.notes || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(staff.monthly_salary).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={!canStaffDelete || deactivateStaff.isPending}
                        title={!canStaffDelete ? "You don't have permission to remove staff" : undefined}
                        onClick={() => deactivateStaff.mutate(staff.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
