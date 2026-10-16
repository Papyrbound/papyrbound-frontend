"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useAccount, updatePreferences, type Preferences } from "@/features/profile/stores/account-store"
import { useReadingTitles } from "@/features/profile/model/reading-titles"
import { ReaderAvatar } from "./reader-avatar"
import { EditProfileDialog } from "./edit-profile-dialog"
import { Card } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Switch } from "@/shared/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import { Kbd } from "@/shared/ui/kbd"

const themes = [{ value: "system", label: "System", icon: MonitorIcon }, { value: "light", label: "Light", icon: SunIcon }, { value: "dark", label: "Dark", icon: MoonIcon }] as const

export function SettingsPage() {
  const { profile, preferences } = useAccount()
  const { activeTitle } = useReadingTitles()
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState("")
  function changePreferences(details: Partial<Preferences>) {
    const saved = updatePreferences(details)
    setMessage(saved ? "Preferences saved on this device." : "Preferences changed for this session. Device storage is unavailable.")
  }
  return <section className="reader-page reader-settings" aria-labelledby="settings-heading">
    <header className="reader-page-heading"><div><h1 id="settings-heading">Settings</h1><p>Make this space feel like yours.</p></div></header>
    <Card className="reader-settings-card"><h2>Profile</h2><div className="reader-settings-profile"><ReaderAvatar seed={profile.avatarSeed} size={56} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{profile.name}</p><p className="text-sm text-muted-foreground">{activeTitle}</p>{profile.bio && <p className="mt-2 text-xs text-muted-foreground wrap-anywhere">{profile.bio}</p>}</div><Button variant="outline" onClick={() => setEditing(true)}>Edit profile</Button></div></Card>
    <Card className="reader-settings-card"><h2>Appearance</h2><p className="reader-setting-help">Choose a theme for your reading space.</p>
      <ToggleGroup value={[preferences.theme]} onValueChange={(value) => { const theme = value[0]; if (theme === "system" || theme === "light" || theme === "dark") changePreferences({ theme }) }} aria-label="Theme" className="reader-theme-options" spacing={3}>
        {themes.map(({ value, label, icon: Icon }) => <ToggleGroupItem key={value} value={value} className="reader-theme-option" aria-label={`${label} theme`}><Icon /><span>{label}</span>{preferences.theme === value && <CheckIcon className="ml-auto size-4" />}</ToggleGroupItem>)}
      </ToggleGroup>
      <div className="reader-setting-row"><div><label htmlFor="setting-dots">Canvas dots</label><p>Show the subtle dot pattern behind your shelves.</p></div><Switch aria-label="Canvas dots" id="setting-dots" checked={preferences.showDots} onCheckedChange={(showDots) => changePreferences({ showDots })} /></div>
      <div className="reader-setting-row"><div><label htmlFor="setting-motion">Reduce animations</label><p>Keep transitions still. Your device’s motion preference is also respected.</p></div><Switch aria-label="Reduce animations" id="setting-motion" checked={preferences.reduceMotion} onCheckedChange={(reduceMotion) => changePreferences({ reduceMotion })} /></div>
    </Card>
    <Card className="reader-settings-card"><h2>Keyboard shortcuts</h2><div className="reader-setting-row"><div><p className="text-foreground!">Search books</p></div><span className="flex gap-1"><Kbd>Ctrl / ⌘</Kbd><Kbd>K</Kbd></span></div><div className="reader-setting-row"><div><p className="text-foreground!">Toggle sidebar</p></div><span className="flex gap-1"><Kbd>Ctrl / ⌘</Kbd><Kbd>B</Kbd></span></div></Card>
    <p className="reader-section-caption">Profile and appearance preferences are saved on this device. Books, lists, annotations, and reading activity currently reset when you reload the app.</p>
    <p className="text-xs text-muted-foreground">Avatar artwork by <Link href="https://github.com/uxderrick/navii" target="_blank" rel="noreferrer" className="underline underline-offset-2">Navii</Link>.</p>
    <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>
    {editing && <EditProfileDialog onClose={() => setEditing(false)} />}
  </section>
}
