"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { useAccount, updateAccount } from "@/features/profile/stores/account-store"
import { useReadingTitles } from "@/features/profile/model/reading-titles"
import { ReaderAvatar, avatarSeeds } from "./reader-avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"

export function EditProfileDialog({ onClose }: { onClose: () => void }) {
  const { profile } = useAccount()
  const { activeTitle } = useReadingTitles()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [avatarSeed, setAvatarSeed] = useState(profile.avatarSeed)
  const [open, setOpen] = useState(true)
  const nameRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  return <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={(isOpen) => { if (!isOpen) onClose() }}>
    <DialogContent className="reader-profile-dialog" initialFocus={nameRef}>
      <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>A little more you. Saved on this device.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return
        const saved = updateAccount((current) => ({ ...current, profile: { ...current.profile, name: name.trim(), bio: bio.trim(), avatarSeed } }))
        if (saved) setOpen(false)
        else setError("Your profile is updated for this session. Device storage is unavailable, so it may reset when you close the app.")
      }}>
        <div className="flex items-center gap-4"><ReaderAvatar seed={avatarSeed} size={64} /><div className="min-w-0"><p className="truncate text-base font-medium">{name.trim() || "Your name"}</p><p className="text-sm text-muted-foreground">{activeTitle}</p></div></div>
        <fieldset><legend className="mb-3 text-sm">Choose your avatar</legend>
          <ToggleGroup value={[avatarSeed]} onValueChange={(value) => { if (value[0]) setAvatarSeed(value[0]) }} aria-label="Profile avatar" className="reader-avatar-picker" spacing={2}>
            {avatarSeeds.map((seed, index) => <ToggleGroupItem key={seed} value={seed} aria-label={`Avatar ${index + 1}`} className="reader-avatar-choice"><ReaderAvatar seed={seed} size={42} />{avatarSeed === seed && <CheckIcon className="reader-avatar-check" />}</ToggleGroupItem>)}
          </ToggleGroup>
          <p className="mt-2 text-[11px] text-muted-foreground">Avatars by <Link href="https://github.com/uxderrick/navii" target="_blank" rel="noreferrer" className="underline underline-offset-2">Navii</Link></p>
        </fieldset>
        <div className="space-y-2"><label htmlFor="profile-name">Display name</label><Input id="profile-name" ref={nameRef} value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} /></div>
        <div className="space-y-2"><label htmlFor="profile-bio">About you <span className="text-muted-foreground">(optional)</span></label><Textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={180} rows={2} placeholder="What do you love to read?" /><p className="text-right text-xs text-muted-foreground">{bio.length}/180</p></div>
        {error && <p role="status" className="text-sm text-muted-foreground">{error}</p>}
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={!name.trim()}>Save profile</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
