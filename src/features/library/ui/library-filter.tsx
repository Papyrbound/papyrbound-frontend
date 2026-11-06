"use client";

import {
  ListFilter,
  Library,
  BookOpen,
  Bookmark,
  CircleCheck,
  Clock,
  ArrowDownAZ,
  ArrowUpAZ,
} from "lucide-react";

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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
            {(
              [
                ["all", "All books", Library],
                ["reading", "In progress", BookOpen],
                ["new", "Not started", Bookmark],
                ["finished", "Finished", CircleCheck],
              ] as const
            ).map(([v, l, Icon]) => (
              <DropdownMenuRadioItem key={v} value={v}>
                <Icon aria-hidden="true" className="text-muted-foreground" />
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
              <Clock aria-hidden="true" className="text-muted-foreground" />
              Recently added
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="az">
              <ArrowDownAZ
                aria-hidden="true"
                className="text-muted-foreground"
              />
              Title: A–Z
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="za">
              <ArrowUpAZ aria-hidden="true" className="text-muted-foreground" />
              Title: Z–A
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
