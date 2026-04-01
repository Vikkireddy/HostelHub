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
import { RoomForm } from "./types";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>Create a new room. All fields are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {isError && <Typography variant="error">{errorMessage}</Typography>}
          <RoomFormFields form={form} setForm={setForm} idPrefix="create" capacityMin={1} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
