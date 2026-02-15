"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { fetchWithHostel } from "@/lib/api-client";
import { Box } from "@/components/ui/box";

import {  type InactiveStudent, type Student } from "./columns";
import { StudentCheckoutModal } from "./student-checkout-modal";
import { StudentsSkeleton } from "@/components/skeletons";
import { useSearchStore } from "@/lib/search-store";

import { AddStudentDialog } from "./add-student-dialog";
import { EditStudentDialog } from "./edit-student-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentsTabs } from "./students-tabs";

import { initialStudentForm, type StudentFormValues } from "./students.constants";
import { filterStudents } from "./students.utils";

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

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const { query } = useSearchStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<StudentFormValues>({ ...initialStudentForm });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormValues>({ ...initialStudentForm });
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");

  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);

  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ["students", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/students", hostelId).then((r) => r.json()),
  });

  const { data: inactiveData, isLoading: inactiveLoading } = useQuery<InactiveStudent[] | { error?: string }>({
    queryKey: ["students-left", hostelId],
    queryFn: async () => {
      const res = await fetchWithHostel("/api/students/left", hostelId);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      return json;
    },
  });

  const inactiveStudents = Array.isArray(inactiveData) ? inactiveData : [];
  const searchFiltered = useMemo(() => filterStudents(students, query), [students, query]);
  const filteredStudents = useMemo(() => {
    let result = searchFiltered;
    if (filterRoom !== "all") {
      const rid = Number(filterRoom);
      result = result.filter((s) => Number(s.room_id) === rid);
    }
    if (filterPaymentStatus !== "all") {
      result = result.filter((s) => (s.payment_status ?? "") === filterPaymentStatus);
    }
    return result;
  }, [searchFiltered, filterRoom, filterPaymentStatus]);
  const filteredInactive = useMemo(() => filterStudents(inactiveStudents, query), [inactiveStudents, query]);

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/rooms", hostelId).then((r) => r.json()),
  });

  const markAsLeft = useMutation({
    mutationFn: async (student: Student) => {
      const res = await fetchWithHostel(
        `/api/students/${student.id}/leave`,
        hostelId,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark student as left");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-left"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setCheckoutModalOpen(false);
      setCheckoutStudent(null);
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: StudentFormValues }) => {
      const res = await fetchWithHostel(`/api/students/${id}`, hostelId, {
        method: "PATCH",
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
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-dues"] });
      setEditForm({ ...initialStudentForm });
      setEditModalOpen(false);
      setEditingStudent(null);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (student: Student) => {
      const res = await fetchWithHostel(
        `/api/students/${student.id}`,
        hostelId,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-left"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setDeleteModalOpen(false);
      setDeleteStudent(null);
    },
  });

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
      setForm({ ...initialStudentForm });
      setModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    createStudent.mutate(form);
  };

  const availableRooms = rooms.filter(
    (r) => r.status !== "maintenance" && (r.occupancy ?? 0) < r.capacity
  );

  const roomsForEdit = (currentRoomId?: number) =>
    rooms.filter(
      (r) =>
        r.status !== "maintenance" &&
        ((r.occupancy ?? 0) < r.capacity || r.id === currentRoomId)
    );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      email: student.email || "",
      phone: student.phone,
      room_id: student.room_id ? String(student.room_id) : "",
      course: student.course || "",
      join_date: student.join_date ? student.join_date.slice(0, 10) : "",
      id_proof_type: student.id_proof_type || "",
      id_proof_number: student.id_proof_number || "",
      address: student.address || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editForm.name.trim() || !editForm.phone.trim()) return;
    updateStudent.mutate({ id: editingStudent.id, data: editForm });
  };

  const handleCheckOut = (student: Student) => {
    if ((student.pending_dues ?? 0) > 0) return;
    setCheckoutStudent(student);
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = (student: Student) => {
    markAsLeft.mutate(student);
  };

  const handleDelete = (student: Student) => {
    setDeleteStudent(student);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteStudent) deleteStudentMutation.mutate(deleteStudent);
  };

  const canDeleteStudent = (student: Student) => (student.payment_count ?? 0) === 0;

  if (isLoading) return <StudentsSkeleton />;
  if (error) return <Box className="p-8 text-red-600">{t("FAILED_TO_LOAD_STUDENTS")}</Box>;

  return (
    <Box className="space-y-8">
      <Box className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("STUDENT_MANAGEMENT")}</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("ADD_STUDENT")}
        </Button>
      </Box>

      <AddStudentDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isPending={createStudent.isPending}
        error={createStudent.error}
        availableRooms={availableRooms}
      />

      <EditStudentDialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingStudent(null);
        }}
        student={editingStudent}
        form={editForm}
        onFormChange={setEditForm}
        onSubmit={handleEditSubmit}
        isPending={updateStudent.isPending}
        error={updateStudent.error}
        roomsForEdit={roomsForEdit}
      />

      <StudentCheckoutModal
        open={checkoutModalOpen}
        onOpenChange={(open) => {
          setCheckoutModalOpen(open);
          if (!open) setCheckoutStudent(null);
        }}
        student={checkoutStudent}
        onConfirm={handleConfirmCheckout}
        isPending={markAsLeft.isPending}
      />

      <DeleteStudentDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setDeleteStudent(null);
        }}
        student={deleteStudent}
        onConfirm={handleConfirmDelete}
        isPending={deleteStudentMutation.isPending}
      />

      <StudentsTabs
        students={students}
        filteredStudents={filteredStudents}
        inactiveStudents={inactiveStudents}
        filteredInactive={filteredInactive}
        inactiveLoading={inactiveLoading}
        rooms={rooms}
        filterRoom={filterRoom}
        filterPaymentStatus={filterPaymentStatus}
        onFilterRoomChange={setFilterRoom}
        onFilterPaymentStatusChange={setFilterPaymentStatus}
        onCheckOut={handleCheckOut}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canDeleteStudent={canDeleteStudent}
      />
    </Box>
  );
}
