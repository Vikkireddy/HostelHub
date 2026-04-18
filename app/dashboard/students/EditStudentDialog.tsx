"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { StudentFormFields } from "./StudentFormFields";
import type { EditStudentDialogProps } from "./students.types";

export function EditStudentDialog({
  open,
  onOpenChange,
  student,
  form,
  onFormChange,
  onSubmit,
  isPending,
  error,
  roomsForEdit,
  idProofError,
  phoneError,
}: EditStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Resident</DialogTitle>
          <DialogDescription>
            Update resident details. All fields are mandatory. Change room to reassign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Typography variant="error">{error.message}</Typography>}
          <StudentFormFields
            form={form}
            onChange={onFormChange}
            rooms={roomsForEdit(student?.room_id)}
            idPrefix="edit"
            idProofError={idProofError}
            phoneError={phoneError}
            roomCaption="Change room to reassign the resident. Current room is always available."
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
