"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";

const shortcuts = [
  { label: "Search library", keys: ["Ctrl / ⌘", "K"] },
  { label: "Toggle sidebar", keys: ["Ctrl / ⌘", "B"] },
];
const navigation = [
  { label: "Move through search results", keys: ["↑", "↓"] },
  { label: "Select a result or menu item", keys: ["Enter"] },
  { label: "Move between controls", keys: ["Tab"] },
  { label: "Close a menu or dialog", keys: ["Esc"] },
];
const reading = [
  { label: "Hide or show reading controls", keys: ["Ctrl / ⌘", "Shift", "F"] },
  { label: "Previous / next chapter or page", keys: ["←", "→"] },
];

export function KeyboardShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto sm:max-w-[440px]">
        <DialogHeader className="pr-8">
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>A quicker way around your library.</DialogDescription>
        </DialogHeader>
        {[{ title: "Anywhere", rows: shortcuts }, { title: "Navigation", rows: navigation }, { title: "While reading", rows: reading }].map(({ title, rows }) => (
          <section key={title} aria-label={title}>
            <h2 className="mb-2 text-xs font-medium text-muted-foreground">{title}</h2>
            <dl className="divide-y divide-border">
              {rows.map(({ label, keys }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[13px]">{label}</dt>
                  <dd className="shrink-0"><KbdGroup>{keys.map((key) => <Kbd key={key} className="rounded-md px-1.5">{key}</Kbd>)}</KbdGroup></dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <p className="text-xs text-muted-foreground">Use Ctrl on Windows and Linux, or ⌘ on Mac.</p>
      </DialogContent>
    </Dialog>
  );
}
