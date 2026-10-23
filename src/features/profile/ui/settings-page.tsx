"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  useAccount,
  updatePreferences,
  type Preferences,
} from "@/features/profile/stores/account-store";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { ReaderAvatar } from "./reader-avatar";
import { EditProfileDialog } from "./edit-profile-dialog";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Kbd } from "@/shared/ui/kbd";

const themes = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const;

export function SettingsPage() {
  const { profile, preferences } = useAccount();
  const { activeTitle } = useReadingTitles();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  function changePreferences(details: Partial<Preferences>) {
    const saved = updatePreferences(details);
    setMessage(
      saved
        ? "Preferences saved on this device."
        : "Preferences changed for this session. Device storage is unavailable.",
    );
  }
  return (
    <section
      className="reader-page reader-settings max-[800px]:p-6 max-[600px]:px-5 max-[600px]:pt-5 max-[600px]:pb-9 p-[28px_40px_48px] w-full min-w-0 max-w-[1280px] m-[0_auto] max-w-[980px]"
      aria-labelledby="settings-heading"
    >
      <header className="reader-page-heading [&_p:not(.reader-kicker)]:mt-2 [&_p:not(.reader-kicker)]:text-[13px] [&_p:not(.reader-kicker)]:text-muted-foreground max-[600px]:[&_h1]:text-2xl flex flex-wrap items-center justify-between gap-[20px] mb-[28px] [&_h1]:text-[28px] [&_h1]:[line-height:1.2] [&_h1]:font-medium [&_h1]:tracking-[-.8px]">
        <div>
          <h1 id="settings-heading">Settings</h1>
          <p>Make this space feel like yours.</p>
        </div>
      </header>
      <Card className="reader-settings-card mb-5 gap-0 rounded-[20px] p-6 shadow-none ring-0 [&_h2]:text-base [&_h2]:font-medium max-[600px]:p-5">
        <h2>Profile</h2>
        <div className="reader-settings-profile max-[600px]:flex-wrap max-[600px]:[&>button]:w-full flex items-center gap-[16px] mt-[22px]">
          <ReaderAvatar seed={profile.avatarSeed} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{activeTitle}</p>
            {profile.bio && (
              <p className="mt-2 text-xs text-muted-foreground wrap-anywhere">
                {profile.bio}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit profile
          </Button>
        </div>
      </Card>
      <Card className="reader-settings-card mb-5 gap-0 rounded-[20px] p-6 shadow-none ring-0 [&_h2]:text-base [&_h2]:font-medium max-[600px]:p-5">
        <h2>Appearance</h2>
        <p className="reader-setting-help text-[12px] text-muted-foreground [line-height:1.8] mt-[6px]">
          Choose a theme for your reading space.
        </p>
        <ToggleGroup
          value={[preferences.theme]}
          onValueChange={(value) => {
            const theme = value[0];
            if (theme === "system" || theme === "light" || theme === "dark")
              changePreferences({ theme });
          }}
          aria-label="Theme"
          className="reader-theme-options my-5 mb-2 grid w-full grid-cols-3 max-[600px]:gap-2"
          spacing={3}
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="reader-theme-option flex h-16 min-w-0 justify-start gap-[10px] rounded-2xl border border-border p-4 font-normal aria-pressed:border-ring aria-pressed:bg-muted max-[600px]:h-auto max-[600px]:min-h-[70px] max-[600px]:flex-wrap max-[600px]:justify-center max-[600px]:gap-2 max-[600px]:px-2 max-[600px]:py-3 max-[600px]:[&_svg:last-child:not(:first-child)]:hidden"
              aria-label={`${label} theme`}
            >
              <Icon />
              <span>{label}</span>
              {preferences.theme === value && (
                <CheckIcon className="ml-auto size-4" />
              )}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="reader-setting-row last:pb-0 [&+.reader-setting-row]:mt-0 flex items-center justify-between gap-[24px] p-[20px_0] [border-top:1px_solid_var(--border)] mt-[12px] [&_label]:text-[14px] [&_label]:[cursor:pointer] [&_p]:text-[12px] [&_p]:text-muted-foreground [&_p]:mt-[4px] [&_p]:[line-height:1.8]">
          <div>
            <label htmlFor="setting-dots">Canvas dots</label>
            <p>Show the subtle dot pattern behind your shelves.</p>
          </div>
          <Switch
            aria-label="Canvas dots"
            id="setting-dots"
            checked={preferences.showDots}
            onCheckedChange={(showDots) => changePreferences({ showDots })}
          />
        </div>
        <div className="reader-setting-row last:pb-0 [&+.reader-setting-row]:mt-0 flex items-center justify-between gap-[24px] p-[20px_0] [border-top:1px_solid_var(--border)] mt-[12px] [&_label]:text-[14px] [&_label]:[cursor:pointer] [&_p]:text-[12px] [&_p]:text-muted-foreground [&_p]:mt-[4px] [&_p]:[line-height:1.8]">
          <div>
            <label htmlFor="setting-motion">Reduce animations</label>
            <p>
              Keep transitions still. Your device’s motion preference is also
              respected.
            </p>
          </div>
          <Switch
            aria-label="Reduce animations"
            id="setting-motion"
            checked={preferences.reduceMotion}
            onCheckedChange={(reduceMotion) =>
              changePreferences({ reduceMotion })
            }
          />
        </div>
      </Card>
      <Card className="reader-settings-card mb-5 gap-0 rounded-[20px] p-6 shadow-none ring-0 [&_h2]:text-base [&_h2]:font-medium max-[600px]:p-5">
        <h2>Keyboard shortcuts</h2>
        <div className="reader-setting-row last:pb-0 [&+.reader-setting-row]:mt-0 flex items-center justify-between gap-[24px] p-[20px_0] [border-top:1px_solid_var(--border)] mt-[12px] [&_label]:text-[14px] [&_label]:[cursor:pointer] [&_p]:text-[12px] [&_p]:text-muted-foreground [&_p]:mt-[4px] [&_p]:[line-height:1.8]">
          <div>
            <p className="text-foreground!">Search books</p>
          </div>
          <span className="flex gap-1">
            <Kbd>Ctrl / ⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
        <div className="reader-setting-row last:pb-0 [&+.reader-setting-row]:mt-0 flex items-center justify-between gap-[24px] p-[20px_0] [border-top:1px_solid_var(--border)] mt-[12px] [&_label]:text-[14px] [&_label]:[cursor:pointer] [&_p]:text-[12px] [&_p]:text-muted-foreground [&_p]:mt-[4px] [&_p]:[line-height:1.8]">
          <div>
            <p className="text-foreground!">Toggle sidebar</p>
          </div>
          <span className="flex gap-1">
            <Kbd>Ctrl / ⌘</Kbd>
            <Kbd>B</Kbd>
          </span>
        </div>
      </Card>
      <p className="reader-section-caption text-[12px] [line-height:1.8] text-muted-foreground m-[20px_0]">
        Profile and appearance preferences are saved on this device. Books,
        lists, annotations, and reading activity currently reset when you reload
        the app.
      </p>
      <p className="text-xs text-muted-foreground">
        Avatar artwork by{" "}
        <Link
          href="https://github.com/uxderrick/navii"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Navii
        </Link>
        .
      </p>
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {message}
      </p>
      {editing && <EditProfileDialog onClose={() => setEditing(false)} />}
    </section>
  );
}
