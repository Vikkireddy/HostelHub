"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { ID_PROOF_OPTIONS } from "./students.constants";
import type { StudentFormValues } from "./students.constants";

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  rent?: number;
}

interface StudentFormFieldsProps {
  form: StudentFormValues;
  onChange: (updater: (prev: StudentFormValues) => StudentFormValues) => void;
  rooms: Room[];
  idPrefix?: string;
  roomCaption?: string;
}

const textareaClassName =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function StudentFormFields({
  form,
  onChange,
  rooms,
  idPrefix = "",
  roomCaption,
}: StudentFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Box className="space-y-2">
        <Label htmlFor={id("name")}>Name *</Label>
        <Input
          id={id("name")}
          value={form.name}
          onChange={(e) => onChange((f) => ({ ...f, name: e.target.value }))}
          placeholder="Full name"
          required
        />
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("email")}>Email</Label>
        <Input
          id={id("email")}
          type="email"
          value={form.email}
          onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
          placeholder="student@example.com"
        />
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("phone")}>Phone *</Label>
        <Input
          id={id("phone")}
          value={form.phone}
          onChange={(e) => onChange((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Mobile number"
          required
        />
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("course")}>Course</Label>
        <Input
          id={id("course")}
          value={form.course}
          onChange={(e) => onChange((f) => ({ ...f, course: e.target.value }))}
          placeholder="e.g. B.Tech CSE"
        />
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("id_proof_type")}>ID Proof</Label>
        <Select
          value={form.id_proof_type || "none"}
          onValueChange={(v) => onChange((f) => ({ ...f, id_proof_type: v === "none" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select ID proof type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select ID proof</SelectItem>
            {ID_PROOF_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("id_proof_number")}>ID Proof Number</Label>
        <Input
          id={id("id_proof_number")}
          value={form.id_proof_number}
          onChange={(e) => onChange((f) => ({ ...f, id_proof_number: e.target.value }))}
          placeholder="e.g. Aadhaar / PAN number"
        />
      </Box>
      <Box className="space-y-2 sm:col-span-2">
        <Label htmlFor={id("room")}>Assign to Room</Label>
        <Select
          value={form.room_id || "none"}
          onValueChange={(v) => onChange((f) => ({ ...f, room_id: v === "none" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={idPrefix ? "Select room" : "Select which room this student belongs to"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No room assigned</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                Room {r.number} (Floor {r.floor}, {r.type}) — ₹{Number(r.rent || 0).toLocaleString()}/mo
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roomCaption && (
          <Typography variant="caption">{roomCaption}</Typography>
        )}
      </Box>
      <Box className="space-y-2 sm:col-span-2">
        <Label htmlFor={id("address")}>Address</Label>
        <textarea
          id={id("address")}
          rows={3}
          value={form.address}
          onChange={(e) => onChange((f) => ({ ...f, address: e.target.value }))}
          placeholder="Full address"
          className={textareaClassName}
        />
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={id("join_date")}>Join Date</Label>
        <Input
          id={id("join_date")}
          type="date"
          value={form.join_date}
          onChange={(e) => onChange((f) => ({ ...f, join_date: e.target.value }))}
        />
      </Box>
    </Box>
  );
}
