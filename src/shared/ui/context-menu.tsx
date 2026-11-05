"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "cn";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuSeparator as ContextMenuSeparator,
} from "./dropdown-menu";

export function ContextMenuContent({
  className,
  ...props
}: ContextMenuPrimitive.Popup.Props) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        sideOffset={4}
      >
        <ContextMenuPrimitive.Popup
          className={cn(
            "max-h-(--available-height) min-w-48 overflow-y-auto rounded-menu border border-soft-border bg-popover p-1.5 text-popover-foreground shadow-menu outline-none **:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5",
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}
