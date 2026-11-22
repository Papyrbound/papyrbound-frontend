"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { ArrowUpRight, BookCheck, BookOpen, CheckIcon, Highlighter, Library, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { useAccount, updateAccount } from "@/features/profile/stores/account-store";
import { ReaderAvatar } from "./reader-avatar";
import { Card, CardContent } from "@/shared/ui/card";
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
        <h1 id="titles-heading" className="text-2xl font-semibold tracking-tight">Reading titles</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Little milestones for the stories you make time for.</p>
      </header>
      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="gap-0 shadow-none">
          <CardContent className="flex flex-wrap items-center gap-4">
            <ReaderAvatar seed={profile.avatarSeed} src={profile.avatarUrl} size={64} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Your current title</p>
              <h2 className="mt-1 text-xl font-semibold">{activeTitle}</h2>
              <p className="mt-1 break-words text-sm text-muted-foreground">{profile.name}</p>
            </div>
            <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/profile" />}>View profile <ArrowUpRight /></Button>
          </CardContent>
          <div className="mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Shown beneath your name.</span>
            <span className="flex items-center gap-1.5 text-foreground"><Trophy className="size-3.5" />{available.length} of {titles.length} available</span>
          </div>
        </Card>
        <Card className="gap-0 shadow-none">
          <CardContent>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="size-3.5" />{nextTitle ? "Your next milestone" : "Every title is yours"}</p>
            <h2 className="mt-3 text-lg font-medium">{nextTitle?.name ?? "A shelf full of achievements"}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{nextTitle?.requirement ?? "Choose any available title to make it your own."}</p>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={nextTitle ? Math.min(100, nextTitle.current / nextTitle.target * 100) : 100} aria-label={nextTitle ? `${nextTitle.name} progress` : "All titles available"} className="flex-1" />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{nextTitle ? `${Math.min(nextTitle.current, nextTitle.target)} / ${nextTitle.target}` : `${titles.length} / ${titles.length}`}</span>
            </div>
          </CardContent>
        </Card>
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
          {group.items.length ? <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 xl:grid-cols-3">
            {group.items.map((title) => {
              const Icon = titleIcons[titles.indexOf(title)] ?? Trophy;
              const selected = activeTitle === title.name;
              return <Card key={title.name} className={cn("h-full gap-0 border shadow-none ring-0", selected ? "border-foreground/35 bg-accent/40" : "border-border/70")} style={{ "--title-color": title.color } as CSSProperties}>
                <CardContent className="flex h-full flex-col">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--title-color)_20%,var(--card))]"><Icon className="size-5" strokeWidth={1.5} /></span>
                    <span className={cn("flex items-center gap-1.5 text-xs", selected ? "text-foreground" : "text-muted-foreground")}>
                      {selected ? <CheckIcon className="size-3.5" /> : !title.available ? <LockKeyhole className="size-3.5" /> : null}
                      {selected ? "Selected" : title.available ? "Available" : "Locked"}
                    </span>
                  </div>
                  <h2 className="text-base font-medium">{title.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{title.description}</p>
                  <div className="mb-2 mt-5 flex items-start justify-between gap-3 text-xs leading-5 text-muted-foreground">
                    <span>{title.requirement}</span><span className="shrink-0 tabular-nums">{Math.min(title.current, title.target)}/{title.target}</span>
                  </div>
                  <Progress value={Math.min(100, title.current / title.target * 100)} aria-label={`${title.name} progress`} />
                  <Button variant={selected ? "secondary" : "outline"} className="mt-5 w-full" disabled={!title.available || selected} onClick={() => {
                    const saved = updateAccount((current) => ({ ...current, profile: { ...current.profile, title: title.name } }));
                    setMessage(saved ? `${title.name} selected.` : "Title selected for this session. Device storage is unavailable.");
                  }}>
                    {selected ? <><CheckIcon />Current title</> : title.available ? "Use this title" : <><LockKeyhole />Not available yet</>}
                  </Button>
                </CardContent>
              </Card>;
            })}
          </div> : <Card className="items-center px-6 py-10 text-center shadow-none">
            <Trophy className="size-7 text-muted-foreground" />
            <h2 className="text-base font-medium">You’ve unlocked every title</h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">Visit Available to choose the title that feels like you.</p>
          </Card>}
        </TabsContent>)}
      </Tabs>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">Titles reflect what is currently in your library.</p>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
