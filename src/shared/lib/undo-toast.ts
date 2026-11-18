import { toast } from "sonner";
import type { UndoableAction } from "@/features/library/model/undo-actions";

export function offerUndo(action: UndoableAction) {
  let pending = false;
  let complete = false;
  const undo = async () => {
    if (pending || complete) return;
    pending = true;
    try {
      await action.undo();
      complete = true;
      toast.success("Restored");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore this item. Try again.", { action: { label: "Retry", onClick: () => { void undo(); } }, duration: 15_000 });
    } finally { pending = false; }
  };
  toast(action.message, { duration: 15_000, action: { label: "Undo", onClick: () => { void undo(); } } });
}

export function reportActionError(error: unknown) {
  toast.error(error instanceof Error ? error.message : "Could not complete this action. Try again.");
}
