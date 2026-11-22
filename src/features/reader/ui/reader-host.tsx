"use client";

import dynamic from "next/dynamic";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

const ReaderDialog = dynamic(() => import("./reader-dialog").then((module) => module.ReaderDialog), { ssr: false });

export function ReaderHost() {
  const id = useWorkspace((state) => state.readerId);
  const open = useWorkspace((state) => state.dialog === "reader");
  const book = useReadingLists((state) => state.books.find((item) => item.id === id));
  return open && book ? <ReaderDialog key={book.id} book={book} onClose={() => useWorkspace.getState().setDialog(null)} /> : null;
}
