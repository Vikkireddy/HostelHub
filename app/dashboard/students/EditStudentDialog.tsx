"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { StudentFormFields } from "./StudentFormFields";
import type { EditStudentDialogProps } from "./students.types";

const EDIT_STUDENT_FORM_ID = "edit-student-form";

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
  emergencyPhoneError,
}: EditStudentDialogProps) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      className="max-h-[min(90dvh,880px)] sm:max-w-2xl"
      headerTitle="Edit Resident"
      headerDescription={
        <>
          Update resident details. * fields are required. Emergency contact is optional. Change room to
          reassign. Resident type can be changed here; type-specific profile fields are edited in{" "}
          <strong>View details</strong>.
        </>
      }
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4"
      children={
        <form
          id={EDIT_STUDENT_FORM_ID}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
        >
          {error && <Typography variant="error">{error.message}</Typography>}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <StudentFormFields
              form={form}
              onChange={onFormChange}
              rooms={roomsForEdit(student?.room_id)}
              idPrefix="edit"
              idProofError={idProofError}
              phoneError={phoneError}
              emergencyPhoneError={emergencyPhoneError}
              roomCaption="Change room to reassign the resident. Current room is always available."
            />
          </div>
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={EDIT_STUDENT_FORM_ID} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    />
  );
}
