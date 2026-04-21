import { Dispatch, FormEvent, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { RoomFormFields } from "./RoomFormFields";
import { Room, RoomForm } from "./types";

const EDIT_ROOM_FORM_ID = "edit-room-form";

export function EditRoomDialog({
  open,
  onOpenChange,
  form,
  setForm,
  editingRoom,
  onSubmit,
  isError,
  errorMessage,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RoomForm;
  setForm: Dispatch<SetStateAction<RoomForm>>;
  editingRoom: Room | null;
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
      headerTitle="Edit Room"
      headerDescription="Update room details. Capacity cannot be reduced below current occupancy."
      children={
        <form id={EDIT_ROOM_FORM_ID} onSubmit={onSubmit} className="space-y-4">
          {isError && <Typography variant="error">{errorMessage}</Typography>}
          <RoomFormFields
            form={form}
            setForm={setForm}
            idPrefix="edit"
            capacityMin={editingRoom?.occupancy ?? 1}
            showCapacityHint={
              editingRoom ? `Min: ${editingRoom.occupancy} (current occupancy)` : undefined
            }
          />
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={EDIT_ROOM_FORM_ID} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    />
  );
}
