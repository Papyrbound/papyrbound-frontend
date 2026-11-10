"use client"

import { Navii } from "@usenavii/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar"

export const avatarSeeds = Array.from({ length: 12 }, (_, index) => `papyrbound-reader-${String(index + 1).padStart(2, "0")}`)

export function ReaderAvatar({ seed, src, size = 32 }: { seed: string; src?: string; size?: number }) {
  const avatar = <Navii seed={seed} size={size} as="img" animated={false} title="Reader avatar" />
  return (
    <Avatar className="overflow-hidden bg-muted" style={{ width: size, height: size }}>
      {src ? <><AvatarImage src={src} alt="Profile photo" className="object-cover" /><AvatarFallback>{avatar}</AvatarFallback></> : avatar}
    </Avatar>
  )
}
