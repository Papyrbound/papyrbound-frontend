"use client";

import { ListFilter } from "lucide-react";

import { useWorkspace } from "@/app-shell/workspace-store";

import { Button } from "@/shared/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

export function LibraryFilter({ iconOnly = false }: { iconOnly?: boolean }) {
  const { filter, setFilter, sort, setSort } = useWorkspace();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            size={iconOnly ? "icon" : "default"}
            aria-label="Filter books"
            title="Filter books"
            className={iconOnly ? "rounded-lg" : ""}
          />
        }
      >
        <ListFilter />
        {!iconOnly && "Filter"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[248px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
            {[
              ["all", "All books"],
              ["reading", "In progress"],
              ["new", "Not started"],
              ["finished", "Finished"],
            ].map(([v, l]) => (
              <DropdownMenuRadioItem key={v} value={v}>
                {l}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="recent">
              Recently added
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="az">Title: A–Z</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="za">Title: Z–A</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
