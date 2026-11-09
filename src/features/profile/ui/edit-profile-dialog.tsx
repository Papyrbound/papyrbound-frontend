"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, CheckIcon, ChevronsUpDownIcon, Trash2 } from "lucide-react";
import { prepareProfileBanner, prepareProfilePhoto } from "../model/profile-banner";
import {
  useAccount,
  updateAccount,
} from "@/features/profile/stores/account-store";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { ReaderAvatar, avatarSeeds } from "./reader-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function EditProfileDialog({ onClose }: { onClose: () => void }) {
  const { profile } = useAccount();
  const { titles, activeTitle } = useReadingTitles();
  const [title, setTitle] = useLocalUIState(activeTitle);
  const selectedTitle =
    titles.find((item) => item.name === title && item.available)?.name ??
    "Page Turner";
  const [name, setName] = useLocalUIState(profile.name);
  const [bio, setBio] = useLocalUIState(profile.bio);
  const [avatarSeed, setAvatarSeed] = useLocalUIState(profile.avatarSeed);
  const [avatarUrl, setAvatarUrl] = useLocalUIState(profile.avatarUrl);
  const [photoError, setPhotoError] = useLocalUIState("");
  const [processingPhoto, setProcessingPhoto] = useLocalUIState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useLocalUIState(profile.banner);
  const [bannerError, setBannerError] = useLocalUIState("");
  const [processingBanner, setProcessingBanner] = useLocalUIState(false);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useLocalUIState(true);
  const nameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useLocalUIState("");
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="reader-profile-dialog min-h-[min(760px,calc(100dvh-2rem))] max-h-none max-w-[calc(100%-2rem)] grid-rows-[auto_1fr] gap-5 overflow-visible p-6 sm:max-w-[720px] [@media(max-height:740px)]:gap-3 [@media(max-height:740px)]:p-4"
        initialFocus={nameRef}
      >
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            A little more you. Saved on this device.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 [@media(max-height:740px)]:gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim() || processingBanner || processingPhoto) return;
            const saved = updateAccount((current) => ({
              ...current,
              profile: {
                ...current.profile,
                name: name.trim(),
                bio: bio.trim(),
                avatarSeed,
                avatarUrl,
                banner,
                title: selectedTitle,
              },
            }));
            if (saved) setOpen(false);
            else
              setError(
                "Your profile is updated for this session. Device storage is unavailable, so it may reset when you close the app.",
              );
          }}
        >
          <div className="space-y-2">
            <div className="relative flex h-[clamp(64px,14dvh,136px)] items-center justify-center overflow-hidden rounded-xl bg-secondary [@media(max-height:740px)]:h-[clamp(48px,10dvh,74px)]">
              {banner && (
                <Image src={banner} alt="Banner preview" fill sizes="720px" unoptimized={banner.startsWith("data:")} className="object-cover object-[center_48%]" />
              )}
              <div className="relative flex items-center gap-2 rounded-xl bg-card/95 p-2 shadow-soft">
                <Button type="button" variant="secondary" disabled={processingBanner} onClick={() => bannerInput.current?.click()}>
                  <Camera />
                  {processingBanner ? "Preparing image" : banner ? "Change banner" : "Add banner"}
                </Button>
                {banner && <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove banner" disabled={processingBanner} onClick={() => { setBanner(null); setBannerError(""); }}><Trash2 /></Button>}
              </div>
            </div>
            <input
              ref={bannerInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Choose profile banner"
              className="sr-only"
              tabIndex={-1}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setProcessingBanner(true);
                setBannerError("");
                try { setBanner(await prepareProfileBanner(file)); }
                catch (cause) { setBannerError(cause instanceof Error ? cause.message : "This image could not be opened. Choose another image."); }
                finally { setProcessingBanner(false); }
              }}
            />
            {bannerError && <p role="alert" className="text-xs text-destructive">{bannerError}</p>}
          </div>
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
            <div className="row-span-2 sm:row-span-1">
              <ReaderAvatar seed={avatarSeed} src={avatarUrl} size={64} />
            </div>
            <div className="min-w-0 self-end sm:self-center">
              <p className="truncate text-base font-medium">{name.trim() || "Your name"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="xs" disabled={processingPhoto} onClick={() => photoInput.current?.click()}>
                  <Camera />{processingPhoto ? "Preparing photo" : avatarUrl ? "Change photo" : "Upload photo"}
                </Button>
                {avatarUrl && <Button type="button" variant="ghost" size="xs" disabled={processingPhoto} onClick={() => { setAvatarUrl(undefined); setPhotoError(""); }}>Remove photo</Button>}
              </div>
            </div>
            <div className="col-start-2 grid min-w-0 gap-1.5 justify-self-start self-start sm:col-start-3 sm:justify-self-end sm:self-center">
              <span
                id="profile-title-label"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Reading title
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-labelledby="profile-title-label profile-title-value"
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 max-w-full gap-2 rounded-lg px-3 font-normal"
                    />
                  }
                >
                  <span id="profile-title-value">{selectedTitle}</span>
                  <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[264px] max-w-[calc(100vw-3rem)]"
                >
                  <DropdownMenuRadioGroup
                    value={selectedTitle}
                    onValueChange={setTitle}
                  >
                    {titles.map((item) => (
                      <DropdownMenuRadioItem
                        key={item.name}
                        value={item.name}
                        disabled={!item.available}
                      >
                        <div className="grid gap-1">
                          <span>{item.name}</span>
                          {!item.available && (
                            <span className="text-[11px] text-muted-foreground">
                              {item.requirement}
                            </span>
                          )}
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile photo" className="sr-only" tabIndex={-1}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setProcessingPhoto(true);
              setPhotoError("");
              try { setAvatarUrl(await prepareProfilePhoto(file)); }
              catch (cause) { setPhotoError(cause instanceof Error ? cause.message : "This photo could not be opened. Choose another image."); }
              finally { setProcessingPhoto(false); }
            }}
          />
          {photoError && <p role="alert" className="text-xs text-destructive">{photoError}</p>}
          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm">Or choose an avatar</legend>
            <ToggleGroup
              value={avatarUrl ? [] : [avatarSeed]}
              disabled={processingPhoto}
              onValueChange={(value) => {
                if (value[0]) { setAvatarSeed(value[0]); setAvatarUrl(undefined); setPhotoError(""); }
              }}
              aria-label="Profile avatar"
              className="reader-avatar-picker grid w-full grid-cols-4 gap-2 sm:grid-cols-6"
              spacing={2}
            >
              {avatarSeeds.map((seed, index) => (
                <ToggleGroupItem
                  key={seed}
                  value={seed}
                  aria-label={`Avatar ${index + 1}`}
                  className="reader-avatar-choice relative h-[clamp(48px,10dvh,72px)] min-w-0 w-full rounded-xl border border-transparent p-1 aria-pressed:border-foreground aria-pressed:bg-muted [@media(max-height:740px)]:h-[clamp(40px,8dvh,56px)]"
                >
                  <ReaderAvatar seed={seed} size={56} />
                  {!avatarUrl && avatarSeed === seed && (
                    <CheckIcon className="reader-avatar-check" />
                  )}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Avatars by{" "}
              <Link
                href="https://github.com/uxderrick/navii"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Navii
              </Link>
            </p>
          </fieldset>
          <div className="grid items-start gap-4 border-t border-border/60 pt-3 sm:grid-cols-2">
            <div className="grid min-w-0 gap-2.5">
              <label htmlFor="profile-name" className="text-xs font-medium">
                Display name
              </label>
              <Input
                id="profile-name"
                ref={nameRef}
                className="h-11 rounded-xl px-3.5"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={60}
                aria-describedby="profile-name-help"
              />
              <p
                id="profile-name-help"
                className="text-[11px] leading-4 text-muted-foreground"
              >
                Shown beside your avatar.
              </p>
            </div>
            <div className="grid min-w-0 gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="profile-bio" className="text-xs font-medium">
                  About you
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Optional
                </span>
              </div>
              <Textarea
                id="profile-bio"
                className="min-h-11 rounded-xl px-3.5 py-2.5"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={60}
                rows={1}
                placeholder="What do you love to read?"
                aria-describedby="profile-bio-count"
              />
              <p
                id="profile-bio-count"
                className="text-right text-[11px] leading-4 tabular-nums text-muted-foreground"
              >
                {bio.length} / 60
              </p>
            </div>
          </div>
          {error && (
            <p role="status" className="text-sm text-muted-foreground">
              {error}
            </p>
          )}
          <DialogFooter className="mt-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || processingBanner || processingPhoto}>
              Save profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
