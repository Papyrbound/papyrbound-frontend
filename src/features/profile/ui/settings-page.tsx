"use client";

import { useAccount, updatePreferences } from "../stores/account-store";

import { useSettingsUI } from "../stores/settings-ui-store";

import { EditProfileDialog } from "./edit-profile-dialog";

import { Button } from "@/shared/ui/button";

import { Switch } from "@/shared/ui/switch";

import type { ReactNode } from "react";

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
            className="h-9 w-40 justify-between text-[13px] sm:w-60"
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
      className={`flex min-h-[74px] items-center justify-between gap-5 border-b border-border ${className}`}
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
  return (
    <main className="p-5 lg:px-12 lg:py-8">
      <header className="mb-[30px] flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold leading-[42px]">Settings</h1>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
            Make Papyrbound feel like your own.
          </p>
        </div>
        <Button variant="outline" onClick={() => ui.patch({ editing: true })}>
          Edit profile
        </Button>
      </header>
      <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1.554fr)_minmax(300px,1fr)]">
        <div className="space-y-7">
          <section className="rounded-section bg-card px-6 pt-5">
            <h2 className="mb-2 text-base font-semibold leading-[26px]">
              Appearance
            </h2>
            <SettingsRow
              label="Theme"
              description="Choose how Papyrbound looks."
            >
              <div
                className="flex h-9 w-[280px] shrink-0 rounded-xl bg-muted p-1"
                role="group"
                aria-label="Theme"
              >
                {(["system", "light", "dark"] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant="ghost"
                    size="sm"
                    aria-pressed={preferences.theme === theme}
                    className={`h-7 flex-1 rounded-lg px-2 text-[13px] capitalize ${preferences.theme === theme ? "bg-selected shadow-soft" : "text-muted-foreground"}`}
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
              className="min-h-[78px]"
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
              className="min-h-[72px] border-0 pt-2.5"
            >
              <Switch
                aria-label="Show sidebar labels"
                checked={ui.labels}
                onCheckedChange={(labels) => ui.patch({ labels })}
              />
            </SettingsRow>
          </section>
          <section className="rounded-section bg-card px-6 pt-5">
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
            ].map(([label, desc, value, options, change], index) => (
              <SettingsRow
                key={String(label)}
                label={String(label)}
                description={String(desc)}
                className={index ? "min-h-[78px]" : ""}
              >
                <Choice
                  label={String(label)}
                  value={String(value)}
                  options={options as string[]}
                  onChange={change as (v: string) => void}
                />
              </SettingsRow>
            ))}
            <SettingsRow
              label="Resume where you left off"
              description="Open books at your last reading position."
              className="min-h-[68px] border-0"
            >
              <Switch
                aria-label="Resume where you left off"
                checked={ui.resume}
                onCheckedChange={(resume) => ui.patch({ resume })}
              />
            </SettingsRow>
            <p className="h-[52px] pt-3.5 text-xs leading-[18px] text-muted-foreground">
              Changes apply to this preview. EPUB reading is not connected yet.
            </p>
          </section>
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
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
        <section className="pt-1 xl:sticky xl:top-6">
          <h2 className="text-base font-semibold leading-7">Reading preview</h2>
          <p className="mb-[18px] mt-3 text-[13px] leading-[22px] text-muted-foreground">
            Your default reading appearance.
          </p>
          <div
            className={`relative min-h-[526px] rounded-section border border-soft-border px-8 pb-24 pt-12 sm:px-[52px] ${ui.page === "Dark" ? "bg-[#292929] text-[#e5e5e5]" : ui.page === "Paper" ? "bg-[#f3f0e7] text-[#44423d]" : "bg-white text-[#343434]"}`}
          >
            <p className="text-center text-[11px] leading-[18px] text-muted-foreground">
              CHAPTER ONE
            </p>
            <h3
              className={`mb-10 mt-9 text-[30px] font-normal leading-[41px] ${ui.font === "Literata" ? "font-serif" : "font-sans"}`}
            >
              A place between pages
            </h3>
            <div
              className={`space-y-8 text-[21px] ${ui.font === "Literata" ? "font-serif" : "font-sans"} ${ui.spacing === "Compact" ? "leading-7" : ui.spacing === "Spacious" ? "leading-10" : "leading-[31.5px]"}`}
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
            <p className="absolute inset-x-0 bottom-10 text-center text-xs text-muted-foreground">
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
