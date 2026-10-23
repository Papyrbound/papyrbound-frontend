"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useAccount, updateAccount } from "@/features/profile/stores/account-store"
import { useReadingTitles } from "@/features/profile/model/reading-titles"
import { ReaderAvatar, avatarSeeds } from "./reader-avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"

export function EditProfileDialog({ onClose }: { onClose: () => void }) {
  const { profile } = useAccount()
  const { titles, activeTitle } = useReadingTitles()
  const [title, setTitle] = useState(activeTitle)
  const selectedTitle = titles.find((item) => item.name === title && item.available)?.name ?? "Page Turner"
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [avatarSeed, setAvatarSeed] = useState(profile.avatarSeed)
  const [open, setOpen] = useState(true)
  const nameRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  return <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={(isOpen) => { if (!isOpen) onClose() }}>
    <DialogContent className="reader-profile-dialog max-w-[min(720px,calc(100%-32px))] max-h-[calc(100dvh-32px)] overflow-y-auto" initialFocus={nameRef}>
      <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>A little more you. Saved on this device.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return
        const saved = updateAccount((current) => ({ ...current, profile: { ...current.profile, name: name.trim(), bio: bio.trim(), avatarSeed, title: selectedTitle } }))
        if (saved) setOpen(false)
        else setError("Your profile is updated for this session. Device storage is unavailable, so it may reset when you close the app.")
      }}>
        <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
          <div className="row-span-2 sm:row-span-1"><ReaderAvatar seed={avatarSeed} size={80} /></div>
          <p className="min-w-0 self-end truncate text-base font-medium sm:self-center">{name.trim() || "Your name"}</p>
            <div className="col-start-2 grid min-w-0 gap-1.5 justify-self-start self-start sm:col-start-3 sm:justify-self-end sm:self-center">
              <span id="profile-title-label" className="text-[11px] font-medium text-muted-foreground">Reading title</span>
              <DropdownMenu>
                <DropdownMenuTrigger aria-labelledby="profile-title-label profile-title-value" render={<Button type="button" variant="outline" className="h-9 max-w-full gap-3 rounded-xl px-3 font-normal" />}><span id="profile-title-value">{selectedTitle}</span><ChevronsUpDownIcon className="size-4 text-muted-foreground" /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-3rem)]">
                  <DropdownMenuRadioGroup value={selectedTitle} onValueChange={setTitle}>
                    {titles.map((item) => <DropdownMenuRadioItem key={item.name} value={item.name} disabled={!item.available}><div className="grid gap-1"><span>{item.name}</span>{!item.available && <span className="text-[11px] text-muted-foreground">{item.requirement}</span>}</div></DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
        <fieldset><legend className="mb-3 text-sm">Choose your avatar</legend>
          <ToggleGroup value={[avatarSeed]} onValueChange={(value) => { if (value[0]) setAvatarSeed(value[0]) }} aria-label="Profile avatar" className="reader-avatar-picker grid w-full grid-cols-4 max-[600px]:grid-cols-3 max-[380px]:grid-cols-2" spacing={2}>
            {avatarSeeds.map((seed, index) => <ToggleGroupItem key={seed} value={seed} aria-label={`Avatar ${index + 1}`} className="reader-avatar-choice relative h-[120px] min-w-0 rounded-[18px] border border-transparent p-[6px] aria-pressed:border-foreground aria-pressed:bg-muted [&_[data-slot=avatar]]:w-[min(104px,100%)]! [&_[data-slot=avatar]]:h-auto! [&_[data-slot=avatar]]:aspect-square [&_img]:w-full [&_img]:h-full"><ReaderAvatar seed={seed} size={104} />{avatarSeed === seed && <CheckIcon className="reader-avatar-check absolute right-px bottom-px size-[14px]! rounded-full bg-primary p-[2px] text-primary-foreground" />}</ToggleGroupItem>)}
          </ToggleGroup>
          <p className="mt-2 text-[11px] text-muted-foreground">Avatars by <Link href="https://github.com/uxderrick/navii" target="_blank" rel="noreferrer" className="underline underline-offset-2">Navii</Link></p>
        </fieldset>
        <div className="grid items-start gap-6 border-t border-border/60 pt-5 sm:grid-cols-2">
          <div className="grid min-w-0 gap-2.5">
            <label htmlFor="profile-name" className="text-xs font-medium">Display name</label>
            <Input id="profile-name" ref={nameRef} className="h-11 rounded-xl px-3.5" value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} aria-describedby="profile-name-help" />
            <p id="profile-name-help" className="text-[11px] leading-4 text-muted-foreground">Shown beside your avatar.</p>

          </div>
          <div className="grid min-w-0 gap-2.5">
            <div className="flex items-center justify-between gap-2"><label htmlFor="profile-bio" className="text-xs font-medium">About you</label><span className="text-[11px] text-muted-foreground">Optional</span></div>
            <Textarea id="profile-bio" className="min-h-11 rounded-xl px-3.5 py-2.5" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={60} rows={1} placeholder="What do you love to read?" aria-describedby="profile-bio-count" />
            <p id="profile-bio-count" className="text-right text-[11px] leading-4 tabular-nums text-muted-foreground">{bio.length} / 60</p>
          </div>
        </div>
        {error && <p role="status" className="text-sm text-muted-foreground">{error}</p>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={!name.trim()}>Save profile</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
