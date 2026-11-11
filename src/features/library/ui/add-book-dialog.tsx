"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { useRef } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

export function AddBookDialog() {
  const [open, setOpen] = useLocalUIState(false);
  const [title, setTitle] = useLocalUIState("");
  const [author, setAuthor] = useLocalUIState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const { addBook } = useReadingLists();

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setTitle("");
      setAuthor("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="w-8 gap-2 rounded-[10px] border-primary-foreground/10 p-0 text-[13px] font-medium shadow-[0_1px_2px_rgb(0_0_0/12%),inset_0_1px_0_rgb(255_255_255/16%)] transition-[background-color,box-shadow] duration-150 hover:bg-primary/90 hover:shadow-[0_2px_5px_rgb(0_0_0/16%)] sm:w-auto sm:pl-1.5 sm:pr-3"
            title="Import books"
          />
        }
        aria-label="Import books"
      >
        <span className="flex size-5 items-center justify-center rounded-md bg-primary-foreground/10" aria-hidden="true">
          <UploadIcon className="size-3.5" />
        </span>
        <span className="hidden sm:inline">Import books</span>
      </DialogTrigger>
      <DialogContent initialFocus={titleRef}>
        <DialogHeader>
          <DialogTitle>Import books</DialogTitle>
          <DialogDescription>
            Preview your library by adding a title. EPUB file importing is not
            connected yet.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !author.trim()) return;
            addBook({ title, author });
            changeOpen(false);
          }}
        >
          <div className="space-y-2">
            <label htmlFor="add-book-title">Title</label>
            <Input
              ref={titleRef}
              id="add-book-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Book title"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="add-book-author">Author</label>
            <Input
              id="add-book-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Author name"
              required
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!title.trim() || !author.trim()}>
              Add book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
