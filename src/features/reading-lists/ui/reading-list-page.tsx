"use client"

import { useSearchParams } from "next/navigation"

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"

export function ReadingListsPage() {
  const { lists } = useReadingLists()
  const searchParams = useSearchParams()
  const selectedListId = searchParams.get("list")
  const selectedList = lists.find((list) => list.id === selectedListId)

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-card p-6">
        <h1 className="text-2xl">{selectedList?.name ?? "Reading lists"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedList
            ? "Books added to this list will appear here."
            : "Select a list from the sidebar to view its books."}
        </p>
      </div>
    </section>
  )
}
