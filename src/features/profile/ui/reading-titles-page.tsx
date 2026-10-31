"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { type CSSProperties } from "react";
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
  const [message, setMessage] = useLocalUIState("");
  return (
    <section className="reader-page" aria-labelledby="titles-heading">
      <header className="reader-page-heading">
        <div>
          <p className="reader-kicker">A little recognition</p>
          <h1 id="titles-heading">Reading titles</h1>
          <p>Find a title that feels like you.</p>
        </div>
        <span className="reader-count">
          {titles.filter((title) => title.available).length} of {titles.length}{" "}
          available
        </span>
      </header>
      <Card className="reader-current-title">
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
      <p className="reader-section-caption">
        Titles become available as your library grows. Progress reflects the
        books, notes, and collections currently in your library.
      </p>
      <div className="reader-title-grid">
        {titles.map((title) => (
          <Card
            className="reader-title-card"
            key={title.name}
            style={{ "--title-color": title.color } as CSSProperties}
          >
            <div className="reader-title-card-top">
              <span className="reader-title-medal">
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
            <div className="reader-title-progress">
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
