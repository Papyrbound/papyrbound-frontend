import { Suspense } from "react"

import { ReadingListsPage } from "@/features/reading-lists/ui/reading-list-page"

export default function ReadingListsRoute() {
  return (
    <Suspense fallback={null}>
      <ReadingListsPage />
    </Suspense>
  )
}
