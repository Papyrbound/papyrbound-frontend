export function ReadingListsPage() {
  return (
    <section className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-card p-6">
        <h1 className="text-2xl">Reading lists</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a list from the sidebar to view its books.
        </p>
      </div>
    </section>
  )
}
