"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Divider, Typography } from "@mui/material";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Student } from "./students.types";
import { fetchWithHostel } from "@/lib/ApiClient";
import { useAuthStore } from "@/lib/AuthStore";
import {
  RESIDENT_KINDS,
  emptyDetailsForKind,
  mergeDetailsForKind,
  normalizeResidentKind,
  type ResidentKind,
} from "@/lib/residentType.constants";
import { RESIDENT_KIND_LABEL } from "./residentTypeUi";
import { ResidentTypeDetailInputs } from "./ResidentTypeDetailInputs";
import { toast } from "sonner";

function buildPatchBody(
  student: Student,
  opts: {
    kind: ResidentKind;
    details: Record<string, string>;
    course: string;
  }
) {
  return {
    name: student.name,
    gender: student.gender?.trim() || "Other",
    email: student.email || null,
    phone: student.phone ?? "",
    emergency_contact_phone: student.emergency_contact_phone ?? "",
    room_id: student.room_id ?? null,
    course: opts.course?.trim() ? opts.course.trim() : null,
    join_date: student.join_date ? String(student.join_date).slice(0, 10) : null,
    planned_vacate_date: student.planned_vacate_date
      ? String(student.planned_vacate_date).slice(0, 10)
      : null,
    id_proof_type: student.id_proof_type || null,
    id_proof_number: student.id_proof_number || null,
    address: student.address || null,
    resident_type: opts.kind,
    resident_type_details: opts.details,
  };
}

export function ResidentTypeDrawerTab({
  student,
  readOnly = false,
}: {
  student: Student;
  readOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);

  const [kind, setKind] = useState<ResidentKind>(() => normalizeResidentKind(student.resident_type));
  const [details, setDetails] = useState<Record<string, string>>(() =>
    mergeDetailsForKind(normalizeResidentKind(student.resident_type), student.resident_type_details ?? {})
  );
  const [course, setCourse] = useState(() => student.course ?? "");

  // `resident_type_details` is often a new object reference each parent render (e.g. from React Query).
  // Depending on the object directly caused an infinite loop (effect → setState → re-render → new ref → effect).
  const residentTypeDetailsKey = JSON.stringify(student.resident_type_details ?? null);

  useEffect(() => {
    const k = normalizeResidentKind(student.resident_type);
    setKind(k);
    setDetails(mergeDetailsForKind(k, student.resident_type_details ?? {}));
    setCourse(student.course ?? "");
  }, [student.id, student.resident_type, student.course, residentTypeDetailsKey]);

  const setDetail = (key: string, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithHostel(`/api/students/${student.id}`, hostelId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPatchBody(student, { kind, details, course })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || t("RESIDENT_TYPE_SAVE_ERROR"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-left"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-dues"] });
      toast.success(t("RESIDENT_TYPE_SAVED_TOAST"));
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Box className="space-y-4">
      <Divider />
      <Box className="space-y-2">
        <Label htmlFor="drawer-resident-type">{t("RESIDENT_TYPE_LABEL")}</Label>
        <Dropdown
          id="drawer-resident-type"
          value={kind}
          disabled={readOnly}
          onValueChange={(v) => {
            const next = normalizeResidentKind(v);
            setKind(next);
            setDetails(emptyDetailsForKind(next));
          }}
          options={RESIDENT_KINDS.map((k) => ({
            value: k,
            label: t(RESIDENT_KIND_LABEL[k]),
          }))}
          placeholder={t("RESIDENT_TYPE_LABEL")}
        />
      </Box>

      {kind === "student" && (
        <Box className="space-y-2">
          <Label htmlFor="drawer-course">{t("RESIDENT_RT_COURSE")}</Label>
          <Input
            id="drawer-course"
            value={course}
            disabled={readOnly}
            onChange={(e) => setCourse(e.target.value)}
          />
        </Box>
      )}

      <ResidentTypeDetailInputs
        kind={kind}
        details={details}
        onDetailChange={setDetail}
        idPrefix="drawer-rt"
        showStudentCourseHint={false}
        readOnly={readOnly}
      />

      <Box sx={{ pt: 1 }}>
        <Button
          type="button"
          disabled={readOnly || saveMutation.isPending}
          title={readOnly ? "You don't have permission to edit residents" : undefined}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? t("RESIDENT_TYPE_SAVING") : t("RESIDENT_TYPE_SAVE_DRAWER")}
        </Button>
      </Box>
    </Box>
  );
}
