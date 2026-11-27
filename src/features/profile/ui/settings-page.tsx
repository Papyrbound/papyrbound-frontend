"use client";

import { useAccount, updatePreferences } from "../stores/account-store";

import { readerSurface } from "@/features/reader/model/reader-preferences";
import { useSettingsUI } from "../stores/settings-ui-store";

import { EditProfileDialog } from "./edit-profile-dialog";

import { Button } from "@/shared/ui/button";

import { Switch } from "@/shared/ui/switch";

import type { ReactNode } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

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
    <Select items={options.map((option) => ({ label: option, value: option }))} value={value} onValueChange={(next) => { if (next) onChange(next); }}>
      <SelectTrigger aria-label={label} className="w-40 text-[13px] sm:w-60"><SelectValue /></SelectTrigger>
      <SelectContent alignItemWithTrigger={false}><SelectGroup>
        {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
  );
}

function SettingsRow({
  label,
  description,
  children,
  className = "",
}: {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-18 flex-wrap items-center justify-between gap-3 py-4 sm:flex-nowrap sm:gap-5 border-b border-border/60 ${className}`}
    >
      <div>
        <h3 className="text-sm font-medium leading-6">{label}</h3>
        {description && (
          <p className="mt-1 text-xs leading-[18px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { preferences, profile } = useAccount();
  const ui = useSettingsUI();
  const surface = readerSurface(ui.page);
  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-ui-title">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Make Papyrbound feel like your own.
          </p>
        </div>
        <Button variant="outline" onClick={() => ui.patch({ editing: true })}>
          Edit profile
        </Button>
      </header>
      <div className="grid min-w-0 items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="space-y-7">
          <section className="border-b border-border/60 pb-6">
            <h2 className="mb-2 text-base font-semibold leading-[26px]">
              Appearance
            </h2>
            <SettingsRow
              label="Theme"
              description="Choose how Papyrbound looks."
            >
              <div
                className="flex h-9 w-full shrink-0 sm:w-[280px] rounded-button bg-muted p-1"
                role="group"
                aria-label="Theme"
              >
                {(["system", "light", "dark"] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant="ghost"
                    size="sm"
                    aria-pressed={preferences.theme === theme}
                    className={`h-7 flex-1 px-2 text-[13px] capitalize ${preferences.theme === theme ? "bg-selected shadow-soft hover:bg-selected dark:bg-foreground/10 dark:hover:bg-foreground/15" : "text-muted-foreground"}`}
                    onClick={() => updatePreferences({ theme })}
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow
              label="Interface text size"
              description="Adjust labels and navigation."
              className="min-h-18"
            >
              <Choice
                label="Interface text size"
                value={ui.interfaceSize}
                options={["Small", "Default", "Large"]}
                onChange={(interfaceSize) => ui.patch({ interfaceSize })}
              />
            </SettingsRow>
            <SettingsRow
              label="Show sidebar labels"
              className="min-h-18 border-0"
            >
              <Switch
                aria-label="Show sidebar labels"
                checked={ui.labels}
                onCheckedChange={(labels) => ui.patch({ labels })}
              />
            </SettingsRow>
          </section>
          <section className="border-b border-border/60 pb-6">
            <h2 className="mb-2 text-base font-semibold leading-[26px]">
              Reading
            </h2>
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
                ["Georgia", "Sans serif"],
                (font: string) => ui.patch({ font }),
              ],
              [
                "Line spacing",
                "Give your words room to breathe.",
                ui.spacing,
                ["Compact", "Comfortable", "Spacious"],
                (spacing: string) => ui.patch({ spacing }),
              ],
            ].map(([label, desc, value, options, change], index) => (
              <SettingsRow
                key={String(label)}
                label={String(label)}
                description={String(desc)}
                className={index ? "min-h-18" : ""}
              >
                <Choice
                  label={String(label)}
                  value={String(value)}
                  options={options as string[]}
                  onChange={change as (v: string) => void}
                />
              </SettingsRow>
            ))}
            <SettingsRow label="Text size" description="Size of the text inside your books.">
              <Choice label="Reading text size" value={String(ui.reader.fontSize)} options={["14", "16", "18", "20", "22", "24", "26", "28", "30", "32"]} onChange={(value) => ui.patch({ reader: { ...ui.reader, fontSize: Number(value) } })} />
            </SettingsRow>
            <SettingsRow label="Text width" description="Keep lines at a comfortable reading length.">
              <Choice label="Text width" value={ui.reader.measure ?? "Comfortable"} options={["Narrow", "Comfortable", "Wide"]} onChange={(value) => ui.patch({ reader: { ...ui.reader, measure: value as NonNullable<typeof ui.reader.measure> } })} />
            </SettingsRow>
            <SettingsRow label="Margins" description="Space around the text on each page.">
              <Choice label="Margins" value={ui.reader.margins ?? "Comfortable"} options={["Narrow", "Comfortable", "Wide"]} onChange={(value) => ui.patch({ reader: { ...ui.reader, margins: value as NonNullable<typeof ui.reader.margins> } })} />
            </SettingsRow>
            <SettingsRow
              label="Resume where you left off"
              description="Open books at your last reading position."
              className="min-h-18 border-0"
            >
              <Switch
                aria-label="Resume where you left off"
                checked={ui.resume}
                onCheckedChange={(resume) => ui.patch({ resume })}
              />
            </SettingsRow>
            <p className="pt-2 text-xs leading-[18px] text-muted-foreground">
              These defaults apply to your EPUB reader.
            </p>
          </section>
          <section>
            <h2 className="text-ui-section">Library</h2>
            <SettingsRow label="Show demo content" description="Explore fictional books and sample collections. These do not unlock reading titles."><Switch aria-label="Show demo content" checked={ui.showDemo} onCheckedChange={(showDemo) => ui.patch({ showDemo })} /></SettingsRow>
          </section>
          <section className="border-b border-border/60 pb-6">
            <h2 className="text-base font-semibold leading-7">Dictionary</h2>
            <p className="mt-2 text-sm text-muted-foreground">English definitions are included for offline reading. Select a word in an EPUB and choose Look up.</p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Open English WordNet 2025, by the Open English WordNet Community, derived from Princeton WordNet. Adapted under CC BY 4.0. <a href="/dictionary/NOTICE.txt" target="_blank" rel="noreferrer" className="underline underline-offset-2">Source and attribution</a></p>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              {profile.name} · Profile and appearance saved on this device.
            </span>
            <label className="flex items-center gap-3">
              Reduce animations
              <Switch
                aria-label="Reduce animations"
                checked={preferences.reduceMotion}
                onCheckedChange={(reduceMotion) =>
                  updatePreferences({ reduceMotion })
                }
              />
            </label>
          </div>
        </div>
        <section className="pt-1 xl:sticky xl:top-20">
          <h2 className="text-base font-semibold leading-7">Reading preview</h2>
          <p className="mb-[18px] mt-3 text-[13px] leading-[22px] text-muted-foreground">
            Your default reading appearance.
          </p>
          <div
            className="relative min-h-96 rounded-section border border-soft-border pb-24 pt-10"
            style={{ background: surface.background, color: surface.foreground, paddingInline: ui.reader.margins === "Narrow" ? 16 : ui.reader.margins === "Wide" ? 56 : 32 }}
          >
            <p style={{ color: surface.muted }} className="text-center text-xs leading-5">
              CHAPTER ONE
            </p>
            <h3
              className={`mb-6 mt-8 text-2xl font-normal leading-8 ${ui.font === "Georgia" ? "font-[Georgia,serif]" : "font-sans"}`}
            >
              A place between pages
            </h3>
            <div
              style={{ fontSize: ui.reader.fontSize, lineHeight: ui.spacing === "Compact" ? 1.5 : ui.spacing === "Spacious" ? 2 : 1.75 }}
              className={`space-y-6 ${ui.font === "Georgia" ? "font-[Georgia,serif]" : "font-sans"}`}
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
            <p style={{ color: surface.muted }} className="absolute inset-x-0 bottom-10 text-center text-xs">
              1
            </p>
          </div>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            You can change these options while reading, too.
          </p>
        </section>
      </div>
      {ui.editing && (
        <EditProfileDialog onClose={() => ui.patch({ editing: false })} />
      )}
    </main>
  );
}
