"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { StudentFormFields } from "./StudentFormFields";
import { AddStudentDocumentsSection } from "./AddStudentDocumentsSection";
import type { AddStudentDialogProps } from "./students.types";

const ADD_STUDENT_FORM_ID = "add-student-form";

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
  emergencyPhoneError,
  documents,
  onDocumentsChange,
}: AddStudentDialogProps) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      className="max-h-[min(90dvh,880px)] sm:max-w-2xl"
      headerTitle="Add Resident"
      headerDescription={
        <>
          Enter resident details. Fields marked with * are required. Emergency contact is optional. Choose a
          resident type here; type-specific details (education, work, etc.) can be added from{" "}
          <strong>View details</strong> after the resident is created.
        </>
      }
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4"
      children={
        <form
          id={ADD_STUDENT_FORM_ID}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
        >
          {error && <Typography variant="error">{error.message}</Typography>}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <StudentFormFields
              form={form}
              onChange={onFormChange}
              rooms={availableRooms}
              idProofError={idProofError}
              phoneError={phoneError}
              emergencyPhoneError={emergencyPhoneError}
              roomCaption={
                availableRooms.length === 0
                  ? "No rooms available. Add rooms from the Rooms page first."
                  : "Choose the room this resident will be assigned to. Only available rooms are shown."
              }
            />
            <AddStudentDocumentsSection documents={documents} onDocumentsChange={onDocumentsChange} />
          </div>
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={ADD_STUDENT_FORM_ID} disabled={isPending || availableRooms.length === 0}>
            {isPending ? "Saving..." : "Add Resident"}
          </Button>
        </>
      }
    />
  );
}
