import { TooltipHint } from "@/shared/ui/tooltip";

export function ShelfStatusBar({
  label,
  count,
  unit = "book",
}: {
  label: string;
  count: number;
  unit?: "book" | "comic" | "shelf" | "collection";
}) {
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-4 bg-background px-5 text-xs text-muted-foreground md:px-[30px]">
      <TooltipHint content={label}><span className="min-w-0 truncate" tabIndex={0}>{label}</span></TooltipHint>
      <span className="shrink-0">{count} {unit}{count === 1 ? "" : "s"}</span>
    </footer>
  );
}
