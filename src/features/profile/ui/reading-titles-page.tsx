"use client";

import Link from "next/link";
import { ArrowUpRight, BookCheck, BookOpen, CheckIcon, Highlighter, Library, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { useAccount, updateAccount } from "@/features/profile/stores/account-store";
import { ReaderAvatar } from "./reader-avatar";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";

const titleIcons = [BookOpen, Sparkles, Highlighter, Library, BookCheck, Trophy];

export function ReadingTitlesPage() {
  const { titles, activeTitle } = useReadingTitles();
  const { profile } = useAccount();
  const [message, setMessage] = useLocalUIState("");
  const available = titles.filter((title) => title.available);
  const locked = titles.filter((title) => !title.available);
  const nextTitle = locked.toSorted((a, b) => b.current / b.target - a.current / a.target)[0];
  const groups = [
    { value: "all", label: "All titles", items: titles },
    { value: "available", label: "Available", items: available },
    { value: "locked", label: "Locked", items: locked },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:px-10" aria-labelledby="titles-heading">
      <header className="mb-7">
        <h1 id="titles-heading" className="text-ui-title">Reading titles</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Little milestones for the stories you make time for.</p>
      </header>
      <div className="mb-8 grid gap-6 border-b border-border/60 pb-6 md:grid-cols-2">
        <section className="flex items-center gap-4" aria-label="Your current title">
          <ReaderAvatar seed={profile.avatarSeed} src={profile.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-ui-meta text-muted-foreground">Your current title</p>
            <h2 className="mt-1 text-ui-section">{activeTitle}</h2>
            <p className="mt-1 truncate text-ui-label text-muted-foreground">{profile.name} · {available.length} of {titles.length} titles available</p>
          </div>
          <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/profile" />}>Profile <ArrowUpRight /></Button>
        </section>
        <section className="min-w-0" aria-label="Next milestone">
          <p className="text-ui-meta text-muted-foreground">{nextTitle ? "Next milestone" : "Every title is yours"}</p>
          <h2 className="mt-1 text-base font-medium">{nextTitle?.name ?? "A shelf full of achievements"}</h2>
          <p className="mt-1 text-ui-label text-muted-foreground">{nextTitle?.requirement ?? "Choose any available title to make it your own."}</p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={nextTitle ? Math.min(100, nextTitle.current / nextTitle.target * 100) : 100} aria-label="Next milestone progress" className="h-1 flex-1" />
            <span className="text-ui-meta tabular-nums text-muted-foreground">{nextTitle ? `${Math.min(nextTitle.current, nextTitle.target)} / ${nextTitle.target}` : `${titles.length} / ${titles.length}`}</span>
          </div>
        </section>
      </div>
      <Tabs defaultValue="all" className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Filter reading titles">
            {groups.map((group) => <TabsTrigger key={group.value} value={group.value} className="gap-2 px-3 text-xs sm:text-sm">
              {group.label}<span className="text-[11px] tabular-nums text-muted-foreground">{group.items.length}</span>
            </TabsTrigger>)}
          </TabsList>
          <p className="text-xs text-muted-foreground">Progress across your books, comics, notes, and collections.</p>
        </div>
        {groups.map((group) => <TabsContent key={group.value} value={group.value}>
          {group.items.length ? <div className="divide-y divide-border/60">
            {group.items.map((title) => {
              const Icon = titleIcons[titles.indexOf(title)] ?? Trophy;
              const selected = activeTitle === title.name;
              return <section key={title.name} aria-label={title.name} className={cn("flex flex-wrap items-start gap-4 rounded-control px-3 py-5 sm:flex-nowrap", selected && "bg-selected/40")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-5" strokeWidth={1.8} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-sm font-semibold">{title.name}</h2>
                    <span className="flex items-center gap-1 text-ui-meta text-muted-foreground">{selected ? <><CheckIcon className="size-3.5" />Selected</> : !title.available ? <><LockKeyhole className="size-3.5" />Locked</> : "Available"}</span>
                  </div>
                  <p className="mt-1 text-ui-label leading-5 text-muted-foreground">{title.description}</p>
                  {!title.available && <div className="mt-3 max-w-md">
                    <div className="mb-2 flex justify-between gap-3 text-ui-meta text-muted-foreground"><span>{title.requirement}</span><span className="tabular-nums">{Math.min(title.current, title.target)}/{title.target}</span></div>
                    <Progress value={Math.min(100, title.current / title.target * 100)} aria-label={`${title.name} progress`} className="h-1" />
                  </div>}
                </div>
                {title.available && <Button variant={selected ? "secondary" : "outline"} size="sm" disabled={selected} onClick={() => {
                  const saved = updateAccount((current) => ({ ...current, profile: { ...current.profile, title: title.name } }));
                  setMessage(saved ? `${title.name} selected.` : "Title selected for this session. Device storage is unavailable.");
                }}>{selected ? <><CheckIcon />Current title</> : "Use title"}</Button>}
              </section>;
            })}
          </div> : <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Trophy className="size-7 text-muted-foreground" />
            <h2 className="text-base font-medium">You’ve unlocked every title</h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">Visit Available to choose the title that feels like you.</p>
          </div>}

        </TabsContent>)}
      </Tabs>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">Titles reflect what is currently in your library.</p>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
