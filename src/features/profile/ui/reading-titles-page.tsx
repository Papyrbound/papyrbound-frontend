"use client";

import { useState, type CSSProperties } from "react";
import { CheckIcon, LockKeyholeIcon, TrophyIcon } from "lucide-react";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import {
  useAccount,
  updateAccount,
} from "@/features/profile/stores/account-store";
import { ReaderAvatar } from "./reader-avatar";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";

export function ReadingTitlesPage() {
  const { titles, activeTitle } = useReadingTitles();
  const { profile } = useAccount();
  const [message, setMessage] = useState("");
  return (
    <section
      className="reader-page max-[800px]:p-6 max-[600px]:px-5 max-[600px]:pt-5 max-[600px]:pb-9 p-[28px_40px_48px] w-full min-w-0 max-w-[1280px] m-[0_auto]"
      aria-labelledby="titles-heading"
    >
      <header className="reader-page-heading [&_p:not(.reader-kicker)]:mt-2 [&_p:not(.reader-kicker)]:text-[13px] [&_p:not(.reader-kicker)]:text-muted-foreground max-[600px]:[&_h1]:text-2xl flex flex-wrap items-center justify-between gap-[20px] mb-[28px] [&_h1]:text-[28px] [&_h1]:[line-height:1.2] [&_h1]:font-medium [&_h1]:tracking-[-.8px]">
        <div>
          <p className="reader-kicker text-[11px] text-muted-foreground mb-[8px]">
            A little recognition
          </p>
          <h1 id="titles-heading">Reading titles</h1>
          <p>Find a title that feels like you.</p>
        </div>
        <span className="reader-count text-[12px] text-muted-foreground">
          {titles.filter((title) => title.available).length} of {titles.length}{" "}
          available
        </span>
      </header>
      <Card className="reader-current-title flex-row items-center gap-[18px] rounded-[20px] bg-[color-mix(in_srgb,var(--content-lilac)_12%,var(--card))] p-[22px] shadow-none ring-0">
        <ReaderAvatar seed={profile.avatarSeed} size={56} />
        <div>
          <p className="text-xs text-muted-foreground">Your current title</p>
          <h2 className="mt-1 text-xl">{activeTitle}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown beneath your name in Papyrbound.
          </p>
        </div>
        <TrophyIcon className="ml-auto size-7 text-muted-foreground" />
      </Card>
      <p className="reader-section-caption text-[12px] [line-height:1.8] text-muted-foreground m-[20px_0]">
        Titles become available as your library grows. Progress reflects the
        books, notes, and collections currently in your library.
      </p>
      <div className="reader-title-grid grid grid-cols-3 gap-[18px] max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
        {titles.map((title) => (
          <Card
            className="reader-title-card gap-0 rounded-[20px] p-[22px] shadow-none ring-0 [&_[data-slot=progress-track]]:h-1 [&_h2]:text-[18px] [&_h2]:font-medium [&>p]:text-muted-foreground [&>p]:text-[12px] [&>p]:[line-height:1.8] [&>p]:mt-[8px] [&>p]:[min-height:44px]"
            key={title.name}
            style={{ "--title-color": title.color } as CSSProperties}
          >
            <div className="reader-title-card-top flex items-center justify-between gap-[12px] mb-[20px]">
              <span className="reader-title-medal inline-flex items-center justify-center w-[46px] h-[46px] rounded-[15px] text-foreground [background:color-mix(in_srgb,_var(--title-color)_25%,_var(--card))] [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:[stroke-width:1.5]">
                <TrophyIcon />
              </span>
              <span className="text-xs text-muted-foreground">
                {activeTitle === title.name ? (
                  "Selected"
                ) : title.available ? (
                  "Available"
                ) : (
                  <span className="flex items-center gap-1">
                    <LockKeyholeIcon className="size-3" />
                    Not yet
                  </span>
                )}
              </span>
            </div>
            <h2>{title.name}</h2>
            <p>{title.description}</p>
            <div className="reader-title-progress flex justify-between gap-[8px] text-muted-foreground text-[11px] m-[20px_0_10px]">
              <span>{title.requirement}</span>
              <span>
                {Math.min(title.current, title.target)}/{title.target}
              </span>
            </div>
            <Progress
              value={Math.min(100, (title.current / title.target) * 100)}
              aria-label={`${title.name} progress`}
            />
            <Button
              variant={activeTitle === title.name ? "secondary" : "outline"}
              className="mt-5 w-full"
              disabled={!title.available || activeTitle === title.name}
              onClick={() => {
                const saved = updateAccount((current) => ({
                  ...current,
                  profile: { ...current.profile, title: title.name },
                }));
                setMessage(
                  saved
                    ? `${title.name} selected.`
                    : "Title selected for this session. Device storage is unavailable.",
                );
              }}
            >
              {activeTitle === title.name ? (
                <>
                  <CheckIcon />
                  Current title
                </>
              ) : title.available ? (
                "Use this title"
              ) : (
                "Keep reading"
              )}
            </Button>
          </Card>
        ))}
      </div>
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {message}
      </p>
    </section>
  );
}
