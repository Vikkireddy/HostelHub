"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { fetchWithHostel } from "@/lib/ApiClient";
import { Box } from "@/components/ui/box";
import { toast } from "sonner";

import type {
  InactiveStudent,
  ResidentInitialDocuments,
  Student,
  StudentFormValues,
  StudentRoom,
} from "./students.types";
import { StudentsSkeleton } from "@/components/skeletons";
import { useSearchStore } from "@/lib/SearchStore";

import {
  initialStudentForm,
  validateIdProof,
  normalizeIdProof,
  validatePhone,
  validateOptionalPhone,
  normalizePhone,
} from "./students.constants";
import { filterStudents } from "./students.utils";
import { mergeDetailsForKind, normalizeResidentKind } from "@/lib/residentType.constants";
import { SelectHostelPrompt } from "@/components/multi-hostel/SelectHostelPrompt";

const AddStudentDialog = dynamic(
  () => import("./AddStudentDialog").then((m) => m.AddStudentDialog)
);
const EditStudentDialog = dynamic(
  () => import("./EditStudentDialog").then((m) => m.EditStudentDialog)
);
const DeleteStudentDialog = dynamic(
  () => import("./DeleteStudentDialog").then((m) => m.DeleteStudentDialog)
);
const StudentCheckoutModal = dynamic(
  () => import("./StudentCheckoutModal").then((m) => m.StudentCheckoutModal)
);
const StudentsTabs = dynamic(
  () => import("./StudentsTabs").then((m) => m.StudentsTabs)
);
const ResidentDetailsDrawer = dynamic(() =>
  import("./ResidentDetailsDrawer").then((m) => m.ResidentDetailsDrawer)
);
const ImportStudentsDialog = dynamic(() =>
  import("./ImportStudentsDialog").then((m) => m.ImportStudentsDialog)
);

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const query = useSearchStore((s) => s.query);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<StudentFormValues>({ ...initialStudentForm });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormValues>({ ...initialStudentForm });
  const [idProofError, setIdProofError] = useState<string | null>(null);
  const [editIdProofError, setEditIdProofError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [editPhoneError, setEditPhoneError] = useState<string | null>(null);
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string | null>(null);
  const [editEmergencyPhoneError, setEditEmergencyPhoneError] = useState<string | null>(null);
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [importOpen, setImportOpen] = useState(false);
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);
  const [addResidentDocs, setAddResidentDocs] = useState<ResidentInitialDocuments>({
    profilePhoto: null,
    idProofFile: null,
  });

  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canResidentsAdd = hasDashboardPermission(user, "residents", "add");
  const canResidentsEdit = hasDashboardPermission(user, "residents", "edit");
  const canResidentsDelete = hasDashboardPermission(user, "residents", "delete");
  const canDocumentsView = hasDashboardPermission(user, "documents", "view");
  const canDocumentsAdd = hasDashboardPermission(user, "documents", "add");
  const canDocumentsDelete = hasDashboardPermission(user, "documents", "delete");

  if (!hostelId) {
    return <SelectHostelPrompt moduleLabel={t("STUDENT_MANAGEMENT")} />;
  }

  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ["students", hostelId],
    queryFn: async () => {
      const res = await fetchWithHostel("/api/students", hostelId);
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as { error?: string }).error || "Failed to fetch residents");
      }
      return Array.isArray(json) ? (json as Student[]) : [];
    },
    enabled: Boolean(hostelId),
  });

  const { data: inactiveData, isLoading: inactiveLoading } = useQuery<InactiveStudent[] | { error?: string }>({
    queryKey: ["students-left", hostelId],
    queryFn: async () => {
      const res = await fetchWithHostel("/api/students/left", hostelId);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      return json;
    },
    enabled: Boolean(hostelId),
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

  const drawerStudent = useMemo(() => {
    if (!detailsStudent) return null;
    const id = String(detailsStudent.id);
    const fresh = students.find((s) => String(s.id) === id);
    return fresh ?? detailsStudent;
  }, [students, detailsStudent]);

  const { data: roomsData } = useQuery<StudentRoom[]>({
    queryKey: ["rooms", hostelId],
    queryFn: async () => {
      const r = await fetchWithHostel("/api/rooms", hostelId);
      const json = await r.json();
      if (!r.ok) return [];
      return Array.isArray(json) ? json : [];
    },
    enabled: Boolean(hostelId),
  });
  const rooms = Array.isArray(roomsData) ? roomsData : [];

  const markAsLeft = useMutation({
    mutationFn: async (student: Student) => {
      const res = await fetchWithHostel(
        `/api/students/${student.id}/leave`,
        hostelId,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark resident as left");
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
          gender: data.gender,
          email: data.email || null,
          phone: data.phone,
          emergency_contact_phone: data.emergency_contact_phone,
          room_id: data.room_id ? Number(data.room_id) : null,
          course: data.course || null,
          join_date: data.join_date || null,
          planned_vacate_date: data.planned_vacate_date?.trim()
            ? data.planned_vacate_date.trim().slice(0, 10)
            : null,
          id_proof_type: data.id_proof_type || null,
          id_proof_number: data.id_proof_number || null,
          address: data.address || null,
          resident_type: data.resident_type,
          resident_type_details: data.resident_type_details,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update resident");
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
        throw new Error(err.error || "Failed to delete resident");
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
    mutationFn: async (payload: {
      data: StudentFormValues;
      documents: ResidentInitialDocuments;
    }) => {
      const { data } = payload;
      const res = await fetchWithHostel("/api/students", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          gender: data.gender,
          email: data.email || null,
          phone: data.phone,
          emergency_contact_phone: data.emergency_contact_phone,
          room_id: data.room_id ? Number(data.room_id) : null,
          course: data.course || null,
          join_date: data.join_date || null,
          planned_vacate_date: data.planned_vacate_date?.trim()
            ? data.planned_vacate_date.trim().slice(0, 10)
            : null,
          id_proof_type: data.id_proof_type || null,
          id_proof_number: data.id_proof_number || null,
          address: data.address || null,
          resident_type: data.resident_type,
          resident_type_details: data.resident_type_details,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add resident");
      }
      const json = (await res.json()) as { id: number };
      return {
        studentId: Number(json.id),
        documents: payload.documents,
        idProofType: data.id_proof_type || "",
      };
    },
    onSuccess: async ({ studentId, documents, idProofType }) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      const uploads: Promise<Response>[] = [];
      if (documents.profilePhoto) {
        const fd = new FormData();
        fd.set("file", documents.profilePhoto);
        fd.set("category", "profile_photo");
        uploads.push(
          fetchWithHostel(`/api/students/${studentId}/documents`, hostelId, {
            method: "POST",
            body: fd,
          })
        );
      }
      if (documents.idProofFile) {
        const fd = new FormData();
        fd.set("file", documents.idProofFile);
        fd.set("category", "id_proof");
        fd.set(
          "label",
          idProofType.trim() ? `Primary ID (${idProofType.trim()})` : "Primary ID"
        );
        uploads.push(
          fetchWithHostel(`/api/students/${studentId}/documents`, hostelId, {
            method: "POST",
            body: fd,
          })
        );
      }
      if (uploads.length > 0) {
        try {
          const results = await Promise.all(uploads);
          const failed = results.filter((r) => !r.ok);
          if (failed.length > 0) {
            toast.error(t("RESIDENT_DOC_UPLOAD_AFTER_CREATE_FAILED"));
          }
        } catch {
          toast.error(t("RESIDENT_DOC_UPLOAD_AFTER_CREATE_FAILED"));
        }
        queryClient.invalidateQueries({ queryKey: ["student-documents", hostelId, studentId] });
      }

      setForm({ ...initialStudentForm });
      setAddResidentDocs({ profilePhoto: null, idProofFile: null });
      setModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIdProofError(null);
    setPhoneError(null);
    setEmergencyPhoneError(null);
    const {
      name,
      gender,
      email,
      phone,
      emergency_contact_phone,
      room_id,
      course,
      join_date,
      id_proof_type,
      id_proof_number,
      address,
    } = form;
    if (
      !name.trim() ||
      !gender.trim() ||
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
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    const emergErr = validateOptionalPhone(emergency_contact_phone);
    if (emergErr) {
      setEmergencyPhoneError(emergErr);
      return;
    }
    const err = validateIdProof(id_proof_type, id_proof_number);
    if (err) {
      setIdProofError(err);
      return;
    }
    const normalizedForm = {
      ...form,
      phone: normalizePhone(phone),
      emergency_contact_phone: normalizePhone(emergency_contact_phone),
      id_proof_number: normalizeIdProof(id_proof_type, id_proof_number),
    };
    createStudent.mutate({ data: normalizedForm, documents: addResidentDocs });
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
    setDetailsStudent(null);
    setEditingStudent(student);
    const kind = normalizeResidentKind(student.resident_type);
    setEditForm({
      name: student.name,
      gender: student.gender || "",
      email: student.email || "",
      phone: student.phone ?? "",
      emergency_contact_phone: student.emergency_contact_phone ?? "",
      room_id: student.room_id ? String(student.room_id) : "",
      course: student.course || "",
      join_date: student.join_date ? student.join_date.slice(0, 10) : "",
      planned_vacate_date: student.planned_vacate_date
        ? String(student.planned_vacate_date).slice(0, 10)
        : "",
      id_proof_type: student.id_proof_type || "",
      id_proof_number: student.id_proof_number || "",
      address: student.address || "",
      resident_type: kind,
      resident_type_details: mergeDetailsForKind(kind, student.resident_type_details ?? {}),
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditIdProofError(null);
    setEditPhoneError(null);
    setEditEmergencyPhoneError(null);
    const {
      name,
      gender,
      email,
      phone,
      emergency_contact_phone,
      room_id,
      course,
      join_date,
      id_proof_type,
      id_proof_number,
      address,
    } = editForm;
    if (
      !editingStudent ||
      !name.trim() ||
      !gender.trim() ||
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
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setEditPhoneError(phoneErr);
      return;
    }
    const emergErr = validateOptionalPhone(emergency_contact_phone);
    if (emergErr) {
      setEditEmergencyPhoneError(emergErr);
      return;
    }
    const err = validateIdProof(id_proof_type, id_proof_number);
    if (err) {
      setEditIdProofError(err);
      return;
    }
    const normalizedData = {
      ...editForm,
      phone: normalizePhone(phone),
      emergency_contact_phone: normalizePhone(emergency_contact_phone),
      id_proof_number: normalizeIdProof(id_proof_type, id_proof_number),
    };
    updateStudent.mutate({ id: editingStudent.id, data: normalizedData });
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
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("STUDENT_MANAGEMENT")}</h2>
        <Box className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!canResidentsAdd}
            title={!canResidentsAdd ? "You don't have permission to import residents" : undefined}
            onClick={() => setImportOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t("STUDENT_IMPORT_CTA")}
          </Button>
          <Button
            disabled={!canResidentsAdd}
            title={!canResidentsAdd ? "You don't have permission to add residents" : undefined}
            onClick={() => setModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("ADD_STUDENT")}
          </Button>
        </Box>
      </Box>

      <ImportStudentsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        hostelId={hostelId}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ["students"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          queryClient.invalidateQueries({ queryKey: ["payments"] });
          queryClient.invalidateQueries({ queryKey: ["students-with-dues"] });
        }}
      />

      <AddStudentDialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setIdProofError(null);
            setPhoneError(null);
            setEmergencyPhoneError(null);
            setAddResidentDocs({ profilePhoto: null, idProofFile: null });
          }
        }}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isPending={createStudent.isPending}
        error={createStudent.error}
        availableRooms={availableRooms}
        idProofError={idProofError}
        phoneError={phoneError}
        emergencyPhoneError={emergencyPhoneError}
        documents={addResidentDocs}
        onDocumentsChange={setAddResidentDocs}
      />

      <ResidentDetailsDrawer
        open={detailsStudent != null}
        student={drawerStudent}
        onOpenChange={(o) => {
          if (!o) setDetailsStudent(null);
        }}
        canEditResidents={canResidentsEdit}
        canViewDocuments={canDocumentsView}
        canAddDocuments={canDocumentsAdd}
        canDeleteDocuments={canDocumentsDelete}
      />

      <EditStudentDialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setEditingStudent(null);
            setEditIdProofError(null);
            setEditPhoneError(null);
            setEditEmergencyPhoneError(null);
          }
        }}
        student={editingStudent}
        form={editForm}
        onFormChange={setEditForm}
        onSubmit={handleEditSubmit}
        isPending={updateStudent.isPending}
        error={updateStudent.error}
        roomsForEdit={roomsForEdit}
        idProofError={editIdProofError}
        phoneError={editPhoneError}
        emergencyPhoneError={editEmergencyPhoneError}
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
        onViewDetails={(s) => setDetailsStudent(s)}
        onCheckOut={handleCheckOut}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canDeleteStudent={canDeleteStudent}
        canEditResident={canResidentsEdit}
        canCheckOutResident={canResidentsEdit}
        canDeleteResident={canResidentsDelete}
      />
    </Box>
  );
}
