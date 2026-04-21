import { Dispatch, FormEvent, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { RoomFormFields } from "./RoomFormFields";
import { RoomForm } from "./types";

const ADD_ROOM_FORM_ID = "add-room-form";

export function AddRoomDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  isError,
  errorMessage,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RoomForm;
  setForm: Dispatch<SetStateAction<RoomForm>>;
  onSubmit: (e: FormEvent) => void;
  isError: boolean;
  errorMessage?: string;
  isPending: boolean;
}) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle="Add Room"
      headerDescription="Create a new room. All fields are required."
      children={
        <form id={ADD_ROOM_FORM_ID} onSubmit={onSubmit} className="space-y-4">
          {isError && <Typography variant="error">{errorMessage}</Typography>}
          <RoomFormFields form={form} setForm={setForm} idPrefix="create" capacityMin={1} />
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={ADD_ROOM_FORM_ID} disabled={isPending}>
            {isPending ? "Adding..." : "Add Room"}
          </Button>
        </>
      }
    />
  );
}
