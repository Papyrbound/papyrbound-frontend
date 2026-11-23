import { sampleBooks, type SampleBook } from "@/features/home/model/sample-books";
const demoIds = new Set(sampleBooks.map((book) => book.id));
const demoCollections = new Set(["quiet-afternoons", "far-from-home", "after-hours", "weekend-shelf"]);
export const isDemoBook = (book: Pick<SampleBook, "id" | "sourceId">) => !book.sourceId && demoIds.has(book.id);
export const isDemoCollection = (collection: { id: string; bookIds?: string[] }) => demoCollections.has(collection.id) && !collection.bookIds?.some((id) => !demoIds.has(id));
export const visibleLibraryBooks = (books: SampleBook[], showDemo: boolean) => books.filter((book) => showDemo || !isDemoBook(book));
