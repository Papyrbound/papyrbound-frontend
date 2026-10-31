"use client";

import { useAccount, updatePreferences } from "../stores/account-store";

import { useSettingsUI } from "../stores/settings-ui-store";

import { EditProfileDialog } from "./edit-profile-dialog";

import { Button } from "@/shared/ui/button";

import { Switch } from "@/shared/ui/switch";

import { useSidebar } from "@/shared/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { ChevronDown } from "lucide-react";

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="min-w-40 justify-between text-xs sm:min-w-48"
          />
        }
        aria-label={label}
      >
        {value}
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o} value={o}>
              {o}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SettingsPage() {
  const { preferences, profile } = useAccount();
  const ui = useSettingsUI();
  const { open, setOpen } = useSidebar();
  return (
    <main className="p-5 lg:p-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-3 text-xs text-muted-foreground">
            Make Papyrbound feel like your own.
          </p>
        </div>
        <Button variant="outline" onClick={() => ui.patch({ editing: true })}>
          Edit profile
        </Button>
      </header>
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-card p-6">
            <h2 className="mb-5 text-base font-semibold">Appearance</h2>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h3 className="text-sm font-medium">Theme</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Choose how Papyrbound looks.
                </p>
              </div>
              <div
                className="flex rounded-xl bg-muted p-1"
                role="group"
                aria-label="Theme"
              >
                {(["system", "light", "dark"] as const).map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    size="sm"
                    aria-pressed={preferences.theme === t}
                    className={`rounded-lg capitalize ${preferences.theme === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => updatePreferences({ theme: t })}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-5 border-b border-border py-5">
              <label htmlFor="settings-sidebar" className="text-sm font-medium">
                Show sidebar
              </label>
              <Switch
                id="settings-sidebar"
                checked={open}
                onCheckedChange={setOpen}
              />
            </div>
            <div className="flex items-center justify-between gap-5 pt-5">
              <div>
                <label
                  htmlFor="settings-motion"
                  className="text-sm font-medium"
                >
                  Reduce animations
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Keep transitions still.
                </p>
              </div>
              <Switch
                id="settings-motion"
                checked={preferences.reduceMotion}
                onCheckedChange={(reduceMotion) =>
                  updatePreferences({ reduceMotion })
                }
              />
            </div>
          </section>
          <section className="rounded-2xl bg-card p-6">
            <h2 className="mb-5 text-base font-semibold">Reading preview</h2>
            {[
              [
                "Page colour",
                "Set the default reading background.",
                ui.page,
                ["White", "Paper", "Dark"],
                (page: string) => ui.patch({ page }),
              ],
              [
                "Reading font",
                "Choose a comfortable typeface.",
                ui.font,
                ["Literata", "Sans serif"],
                (font: string) => ui.patch({ font }),
              ],
              [
                "Line spacing",
                "Give your words room to breathe.",
                ui.spacing,
                ["Compact", "Comfortable", "Spacious"],
                (spacing: string) => ui.patch({ spacing }),
              ],
            ].map(([title, desc, value, options, change]) => (
              <div
                key={String(title)}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 first:pt-0"
              >
                <div>
                  <h3 className="text-sm font-medium">{String(title)}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {String(desc)}
                  </p>
                </div>
                <Choice
                  label={String(title)}
                  value={String(value)}
                  options={options as string[]}
                  onChange={change as (v: string) => void}
                />
              </div>
            ))}
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              Reading options update the preview. They will apply to EPUB books
              when the reader is connected.
            </p>
          </section>
          <p className="text-xs text-muted-foreground">
            {profile.name} · Profile and appearance saved on this device.
          </p>
        </div>
        <section className="xl:sticky xl:top-6">
          <h2 className="text-base font-semibold">Reading preview</h2>
          <p className="mb-5 mt-2 text-xs text-muted-foreground">
            Your default reading appearance.
          </p>
          <div
            className={`rounded-2xl border border-white/70 px-8 py-10 shadow-sm ${ui.page === "Dark" ? "bg-[#282828] text-[#e5e5e5]" : ui.page === "Paper" ? "bg-[#f3f0e7] text-[#44423d]" : "bg-white text-[#343434]"}`}
          >
            <p className="text-center text-[10px] tracking-widest opacity-60">
              CHAPTER ONE
            </p>
            <h3
              className={`mb-8 mt-9 text-2xl ${ui.font === "Literata" ? "font-serif" : "font-sans"}`}
            >
              A place between pages
            </h3>
            <div
              className={`space-y-6 text-lg ${ui.font === "Literata" ? "font-serif" : "font-sans"} ${ui.spacing === "Compact" ? "leading-7" : ui.spacing === "Spacious" ? "leading-10" : "leading-8"}`}
            >
              <p>
                The room grew quiet as the afternoon light moved across the
                floor. She turned the page, and for a moment the rest of the
                world could wait.
              </p>
              <p>
                There was something reassuring about a story held open: a place
                to return to, a thought left unfinished, a small promise of what
                might come next.
              </p>
            </div>
            <p className="mt-14 text-center text-xs opacity-60">1</p>
          </div>
        </section>
      </div>
      {ui.editing && (
        <EditProfileDialog onClose={() => ui.patch({ editing: false })} />
      )}
    </main>
  );
}
