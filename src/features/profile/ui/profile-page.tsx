"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil, ArrowUpRight } from "lucide-react";
import { useAccount } from "../stores/account-store";
import { useReadingTitles } from "../model/reading-titles";
import { ReaderAvatar } from "./reader-avatar";
import { EditProfileDialog } from "./edit-profile-dialog";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { BookCover } from "@/features/home/ui/book-cover";
import { Button } from "@/shared/ui/button";

const sections = ["Reading", "Highlights", "Activity"] as const;
type Section = (typeof sections)[number];

const activityLabels = {
  added: "Added to the library",
  completed: "Finished reading",
  unread: "Marked as unread",
  deleted: "Removed from the library",
};

export function ProfilePage() {
  const { profile } = useAccount();
  const { activeTitle } = useReadingTitles();
  const { books, activity } = useReadingLists();
  const { annotations } = useAnnotations();
  const { collections } = useCollections();
  const selectBook = useWorkspace((state) => state.selectBook);
  const [editing, setEditing] = useLocalUIState(false);
  const [section, setSection] = useLocalUIState<Section>("Reading");
  const router = useRouter();
  const reading = books.filter((book) => book.progress > 0 && book.progress < 100);
  const bookIds = new Set(books.map((book) => book.id));
  const highlights = annotations.filter(
    (note) => note.kind === "highlight" && bookIds.has(note.bookId),
  );
  const stats = [
    { label: "Books", count: books.length, href: "/library" },
    { label: "Finished", count: books.filter((book) => book.progress >= 100).length, href: "/reading-lists?list=completed" },
    { label: "Highlights", count: highlights.length, href: "/annotations" },
    { label: "Collections", count: collections.length, href: "/collections" },
  ];

  return (
    <main aria-label="Profile" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[760px] overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="relative h-40 bg-secondary sm:h-52">
          <Image
            src="/covers/whale-paper-boat.png"
            alt="A paper boat sailing above an illustrated whale"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 760px"
            className="object-cover object-[center_48%]"
          />
        </div>
        <div className="px-5 pb-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="relative -mt-12 rounded-full ring-[6px] ring-card">
              <ReaderAvatar seed={profile.avatarSeed} size={96} />
            </div>
            <Button variant="outline" className="mt-4 rounded-full px-4" onClick={() => setEditing(true)}>
              <Pencil />
              Edit profile
            </Button>
          </div>
          <h1 className="mt-4 break-words text-2xl font-semibold leading-tight sm:text-[28px]">
            {profile.name}
          </h1>
          <Link href="/reading-titles" className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground">
            {activeTitle}
          </Link>
          {profile.bio ? (
            <p className="mt-4 max-w-xl whitespace-pre-wrap break-words text-sm leading-6">{profile.bio}</p>
          ) : (
            <button className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setEditing(true)}>
              Add a little about yourself
            </button>
          )}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                <span className="mr-1.5 font-semibold text-foreground">{stat.count}</span>
                {stat.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 border-y border-border/70" role="group" aria-label="Profile sections">
          {sections.map((item) => (
            <button
              key={item}
              aria-pressed={section === item}
              onClick={() => setSection(item)}
              className={`border-b-2 px-2 py-4 text-sm outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${section === item ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <section aria-label={section} className="min-h-48 px-5 py-5 sm:px-7">
          {section === "Reading" && (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium">Currently reading</h2>
                <Link href="/reading-activity" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  Reading activity <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
              {reading.length ? (
                <div className="divide-y divide-border/60">
                  {reading.map((book) => (
                    <button
                      key={book.id}
                      className="flex w-full items-center gap-4 rounded-lg py-3 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => { selectBook(book.id); router.push("/library"); }}
                      aria-label={`View ${book.title}`}
                    >
                      <span className="w-10 shrink-0 [&_.book-cover]:rounded-sm [&_.cover-type]:hidden [&_.cover-credit]:hidden"><BookCover book={book} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{book.title}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">{book.author}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{book.progress}% read</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-sm text-muted-foreground">
                  <BookOpen className="mb-3 size-5" />
                  <p>No books in progress yet.</p>
                  <Link href="/library" className="mt-2 inline-block text-foreground underline underline-offset-4">Find your next read</Link>
                </div>
              )}
            </>
          )}
          {section === "Highlights" && (
            highlights.length ? (
              <div className="divide-y divide-border/60">
                {highlights.map((note) => (
                  <Link key={note.id} href="/annotations" className="block rounded-lg py-4 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring">
                    <blockquote className="text-sm leading-6">{note.content}</blockquote>
                    <p className="mt-2 text-xs text-muted-foreground">{books.find((book) => book.id === note.bookId)?.title}</p>
                  </Link>
                ))}
              </div>
            ) : <p className="py-6 text-sm text-muted-foreground">Your saved highlights will appear here.</p>
          )}
          {section === "Activity" && (
            activity.length ? (
              <div className="divide-y divide-border/60">
                {activity.map((event) => (
                  <div key={event.id} className="py-4">
                    <p className="text-xs text-muted-foreground">{activityLabels[event.kind]}</p>
                    <p className="mt-1 text-sm font-medium">{event.bookTitle}</p>
                    <time dateTime={event.at} className="mt-1 block text-xs text-muted-foreground">
                      {new Date(event.at).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            ) : <p className="py-6 text-sm text-muted-foreground">Books you add or finish will appear here.</p>
          )}
        </section>
      </div>
      {editing && <EditProfileDialog onClose={() => setEditing(false)} />}
    </main>
  );
}
