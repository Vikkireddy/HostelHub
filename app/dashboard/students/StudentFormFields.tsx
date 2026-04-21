"use client";

import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Dropdown } from "@/components/ui/dropdown";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { DatePicker } from "@/components/ui/DatePicker";
import { DEFAULT_AC_TYPE } from "@/app/dashboard/rooms/rooms.constants";
import {
  GENDER_OPTIONS,
  ID_PROOF_OPTIONS,
  ID_PROOF_VALIDATIONS,
  normalizeIdProof,
  normalizePhone,
} from "./students.constants";
import type { StudentFormFieldsProps } from "./students.types";
import { ResidentTypeFormSection } from "./ResidentTypeFormSection";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

const textareaClassName =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function StudentFormFields({
  form,
  onChange,
  rooms,
  idPrefix = "",
  roomCaption,
  idProofError,
  phoneError,
  emergencyPhoneError,
}: StudentFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 pl-2">
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("name")}>Name</RequiredLabel>
        <Input
          id={id("name")}
          value={form.name}
          onChange={(e) => onChange((f) => ({ ...f, name: e.target.value }))}
          placeholder="Full name"
          required
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("gender")}>Gender</RequiredLabel>
        <Dropdown
          id={id("gender")}
          value={form.gender || ""}
          onValueChange={(v) => onChange((f) => ({ ...f, gender: v }))}
          options={GENDER_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          placeholder="Select gender"
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("email")}>Email</RequiredLabel>
        <Input
          id={id("email")}
          type="email"
          value={form.email}
          onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
          placeholder="name@example.com"
          required
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("phone")}>Phone</RequiredLabel>
        <Input
          id={id("phone")}
          value={form.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange((f) => ({ ...f, phone: val }));
          }}
          onBlur={() => {
            if (form.phone.trim()) {
              const normalized = normalizePhone(form.phone);
              if (normalized !== form.phone) {
                onChange((f) => ({ ...f, phone: normalized }));
              }
            }
          }}
          placeholder="10-digit mobile (e.g. 9876543210)"
          inputMode="numeric"
          maxLength={10}
          required
          className={phoneError ? "border-destructive" : ""}
        />
        {phoneError && (
          <Typography variant="caption" className="text-destructive">
            {phoneError}
          </Typography>
        )}
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("emergency_contact_phone")}>Emergency contact (optional)</Label>
        <Input
          id={id("emergency_contact_phone")}
          value={form.emergency_contact_phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange((f) => ({ ...f, emergency_contact_phone: val }));
          }}
          onBlur={() => {
            if (form.emergency_contact_phone.trim()) {
              const normalized = normalizePhone(form.emergency_contact_phone);
              if (normalized !== form.emergency_contact_phone) {
                onChange((f) => ({ ...f, emergency_contact_phone: normalized }));
              }
            }
          }}
          placeholder="10-digit emergency mobile"
          inputMode="numeric"
          maxLength={10}
          className={emergencyPhoneError ? "border-destructive" : ""}
        />
        {emergencyPhoneError && (
          <Typography variant="caption" className="text-destructive">
            {emergencyPhoneError}
          </Typography>
        )}
      </Box>
      <ResidentTypeFormSection form={form} onChange={onChange} idPrefix={idPrefix} />
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("course")}>Course</RequiredLabel>
        <Input
          id={id("course")}
          value={form.course}
          onChange={(e) => onChange((f) => ({ ...f, course: e.target.value }))}
          placeholder="e.g. B.Tech CSE"
          required
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("id_proof_type")}>ID Proof Type</RequiredLabel>
        <Dropdown
          value={form.id_proof_type || ""}
          onValueChange={(v) =>
            onChange((f) => ({ ...f, id_proof_type: v, id_proof_number: "" }))
          }
          options={ID_PROOF_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          placeholder="Select ID proof type"
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={id("id_proof_number")}>ID Proof Number</RequiredLabel>
        <Input
          id={id("id_proof_number")}
          value={form.id_proof_number}
          onChange={(e) => {
            let val = e.target.value;
            const rule = form.id_proof_type ? ID_PROOF_VALIDATIONS[form.id_proof_type] : null;
            if (form.id_proof_type === "Aadhaar") {
              val = val.replace(/\D/g, "").slice(0, 12);
            } else if (form.id_proof_type === "PAN") {
              val = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
            } else if (form.id_proof_type === "Other") {
              val = val.replace(/[^A-Za-z0-9\s\-]/g, "").slice(0, rule?.maxLength ?? 30);
            } else if (rule?.maxLength) {
              val = val.replace(/[^A-Za-z0-9]/g, "").slice(0, rule.maxLength);
            }
            onChange((f) => ({ ...f, id_proof_number: val }));
          }}
          onBlur={() => {
            if (form.id_proof_type && form.id_proof_number.trim()) {
              const normalized = normalizeIdProof(form.id_proof_type, form.id_proof_number);
              if (normalized !== form.id_proof_number) {
                onChange((f) => ({ ...f, id_proof_number: normalized }));
              }
            }
          }}
          placeholder={
            form.id_proof_type && ID_PROOF_VALIDATIONS[form.id_proof_type]?.placeholder
              ? ID_PROOF_VALIDATIONS[form.id_proof_type].placeholder
              : "Select ID type first, then enter number"
          }
          maxLength={form.id_proof_type ? ID_PROOF_VALIDATIONS[form.id_proof_type]?.maxLength : undefined}
          required
          className={idProofError ? "border-destructive" : ""}
        />
        {idProofError && (
          <Typography variant="caption" className="text-destructive">
            {idProofError}
          </Typography>
        )}
      </Box>
      <Box className="space-y-2 sm:col-span-2">
        <RequiredLabel htmlFor={id("room")}>Assign to Room</RequiredLabel>
        <Dropdown
          value={form.room_id || ""}
          onValueChange={(v) => onChange((f) => ({ ...f, room_id: v }))}
          options={rooms.map((r) => ({
            value: String(r.id),
            label: `Room ${r.number} (Floor ${r.floor}, ${r.type}, ${r.ac_type || DEFAULT_AC_TYPE}) — ₹${Number(r.rent || 0).toLocaleString()}/mo`,
          }))}
          placeholder={idPrefix ? "Select room" : "Select which room this resident belongs to"}
        />
        {roomCaption && (
          <Typography variant="caption">{roomCaption}</Typography>
        )}
      </Box>
      <Box className="space-y-2 sm:col-span-2">
        <RequiredLabel htmlFor={id("address")}>Address</RequiredLabel>
        <textarea
          id={id("address")}
          rows={3}
          value={form.address}
          onChange={(e) => onChange((f) => ({ ...f, address: e.target.value }))}
          placeholder="Full address"
          className={textareaClassName}
          required
        />
      </Box>
      <DatePicker
        id={id("join_date")}
        value={form.join_date ?? ""}
        onChange={(v) => onChange((f) => ({ ...f, join_date: v }))}
        label={<RequiredLabel htmlFor={id("join_date")}>Join Date</RequiredLabel>}
        required
      />
      <Box className="space-y-2">
        <DatePicker
          id={id("planned_vacate_date")}
          value={form.planned_vacate_date ?? ""}
          onChange={(v) => onChange((f) => ({ ...f, planned_vacate_date: v }))}
          label={
            <Label htmlFor={id("planned_vacate_date")} className="text-sm font-medium">
              {t("PLANNED_VACATE_DATE_LABEL")}
            </Label>
          }
          required={false}
        />
        <Typography variant="caption" className="text-muted-foreground">
          {t("PLANNED_VACATE_DATE_OPTIONAL")}
        </Typography>
      </Box>
    </Box>
  );
}
