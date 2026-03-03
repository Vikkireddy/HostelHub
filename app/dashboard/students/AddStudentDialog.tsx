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
import { Box } from "@/components/ui/box";
import { StudentFormFields } from "./StudentFormFields";
import { initialStudentForm, type StudentFormValues } from "./students.constants";

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  rent?: number;
  status?: string;
  capacity?: number;
  occupancy?: number;
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: StudentFormValues;
  onFormChange: (updater: (prev: StudentFormValues) => StudentFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: Error | null;
  availableRooms: Room[];
  idProofError?: string | null;
  phoneError?: string | null;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isPending,
  error,
  availableRooms,
  idProofError,
  phoneError,
}: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Enter student details. All fields are mandatory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Typography variant="error">{error.message}</Typography>}
          <StudentFormFields
            form={form}
            onChange={onFormChange}
            rooms={availableRooms}
            idProofError={idProofError}
            phoneError={phoneError}
            roomCaption={
              availableRooms.length === 0
                ? "No rooms available. Add rooms from the Rooms page first."
                : "Choose the room this student will be assigned to. Only available rooms are shown."
            }
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || availableRooms.length === 0}>
              {isPending ? "Saving..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

