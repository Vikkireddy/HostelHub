"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { fetchWithHostel } from "@/lib/api-client";
import {
  StatsGrid,
  RevenueChart,
  RoomDistributionChart,
  RecentPayments,
  StudentsOverview,
} from "@/components/dashboard";
import type { DashboardStatsProps } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/skeletons";
import { t } from "@/lib/i18n";
import { useSearchStore } from "@/lib/search-store";
import { initialStudentForm, type StudentFormValues } from "./students/students.constants";
import { AddStudentDialog } from "./students/AddStudentDialog";

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  occupancy?: number;
  status: string;
  rent?: number;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { query } = useSearchStore();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState<StudentFormValues>({ ...initialStudentForm });

  const { data, isLoading, error } = useQuery<DashboardStatsProps>({
    queryKey: ["dashboard-stats", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/dashboard/stats", hostelId).then((r) => r.json()),
  });

  const students = data?.students ?? [];
  const payments = data?.payments ?? [];
  const q = query.trim().toLowerCase();
  const filteredStudents = useMemo(
    () =>
      !q
        ? students
        : students.filter(
            (s: { name?: string; room?: string; course?: string; phone?: string }) =>
              (s.name ?? "").toLowerCase().includes(q) ||
              (s.room ?? "").toLowerCase().includes(q) ||
              (s.course ?? "").toLowerCase().includes(q) ||
              (s.phone ?? "").toLowerCase().includes(q)
          ),
    [students, query]
  );
  const filteredPayments = useMemo(
    () =>
      !q
        ? payments
        : payments.filter(
            (p: { student?: string }) =>
              (p.student ?? "").toLowerCase().includes(q)
          ),
    [payments, query]
  );

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/rooms", hostelId).then((r) => r.json()),
  });

  const availableRooms = rooms.filter(
    (r) => r.status !== "maintenance" && (r.occupancy ?? 0) < r.capacity
  );

  const createStudent = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const res = await fetchWithHostel("/api/students", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          phone: data.phone,
          room_id: data.room_id ? Number(data.room_id) : null,
          course: data.course || null,
          join_date: data.join_date || null,
          id_proof_type: data.id_proof_type || null,
          id_proof_number: data.id_proof_number || null,
          address: data.address || null,
          hostel_id: hostelId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setAddStudentForm({ ...initialStudentForm });
      setAddStudentModalOpen(false);
    },
  });

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, room_id, course, join_date, id_proof_type, id_proof_number, address } = addStudentForm;
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !room_id ||
      !course.trim() ||
      !join_date ||
      !id_proof_type ||
      !id_proof_number.trim() ||
      !address.trim()
    )
      return;
    createStudent.mutate(addStudentForm);
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <Box className="p-8 text-red-600">{t("FAILED_TO_LOAD_DASHBOARD")}</Box>;

  const { revenue, roomDistribution, stats, pendingBillsList = [] } = data;

  return (
    <Box className="space-y-8">
  
      <StatsGrid stats={stats} pendingBillsList={pendingBillsList} />

      <Box className="grid gap-6 lg:grid-cols-2">
        <RevenueChart revenue={revenue} />
        <RoomDistributionChart roomDistribution={roomDistribution} />
      </Box>

      <Box className="grid gap-6 lg:grid-cols-2">
        <RecentPayments payments={filteredPayments} />
      </Box>

      <StudentsOverview
        students={filteredStudents}
        headerAction={
          <Button size="sm" variant="outline" onClick={() => setAddStudentModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t("ADD_STUDENT")}
          </Button>
        }
      />

      <AddStudentDialog 
        open={addStudentModalOpen}
        onOpenChange={setAddStudentModalOpen}
        form={addStudentForm}
        onFormChange={setAddStudentForm}
        onSubmit={handleAddStudentSubmit}
        isPending={createStudent.isPending}
        error={createStudent.error}
        availableRooms={availableRooms}
      />
    </Box>
  );
}
