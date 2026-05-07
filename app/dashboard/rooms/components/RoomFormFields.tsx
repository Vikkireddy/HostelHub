import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Dropdown } from "@/components/ui/dropdown";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { VALID_AC_TYPES } from "../rooms.constants";
import { RoomForm } from "./types";

const ROOM_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Maintenance" },
];

export function RoomFormFields({
  form,
  setForm,
  idPrefix,
  capacityMin,
  showCapacityHint,
}: {
  form: RoomForm;
  setForm: Dispatch<SetStateAction<RoomForm>>;
  idPrefix: string;
  capacityMin: number;
  showCapacityHint?: string;
}) {
  return (
    <>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={`${idPrefix}-number`}>Room Number</RequiredLabel>
        <Input
          id={`${idPrefix}-number`}
          value={form.number}
          onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          placeholder="e.g. 101"
          required
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={`${idPrefix}-floor`}>Floor</RequiredLabel>
        <Input
          id={`${idPrefix}-floor`}
          type="number"
          min={1}
          value={form.floor}
          onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
          placeholder="e.g. 1"
          required
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={`${idPrefix}-ac-type`}>AC / Non-AC</RequiredLabel>
        <Dropdown
          value={form.ac_type}
          onValueChange={(v) => setForm((f) => ({ ...f, ac_type: v }))}
          options={VALID_AC_TYPES.map((t) => ({ value: t, label: t }))}
          placeholder="Select"
        />
      </Box>
      <Box className="space-y-2">
        <RequiredLabel htmlFor={`${idPrefix}-capacity`}>Capacity</RequiredLabel>
        <Input
          id={`${idPrefix}-capacity`}
          type="number"
          min={capacityMin}
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          placeholder="e.g. 1"
          required
        />
        {showCapacityHint && <Typography variant="caption">{showCapacityHint}</Typography>}
      </Box>
      <Box className="space-y-2">
        <Label htmlFor={`${idPrefix}-status`}>Status</Label>
        <Dropdown
          value={form.status}
          onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
          options={ROOM_STATUS_OPTIONS}
          placeholder="Select status"
        />
      </Box>
    </>
  );
}
