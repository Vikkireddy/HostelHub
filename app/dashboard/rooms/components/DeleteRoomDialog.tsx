import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Room } from "./types";

export function DeleteRoomDialog({
  open,
  onOpenChange,
  roomToDelete,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomToDelete: Room | null;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle="Delete Room"
      headerDescription={`Are you sure you want to permanently delete Room ${roomToDelete?.number ?? ""}? This cannot be undone.`}
      footerComponent={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    />
  );
}
