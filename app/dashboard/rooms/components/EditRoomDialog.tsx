import { Dispatch, FormEvent, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { RoomFormFields } from "./RoomFormFields";
import { Room, RoomForm } from "./types";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>
            Update room details. Capacity cannot be reduced below current occupancy.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
