import { defaultProfileBanner } from "./profile-banner";

export type LocalProfile = {
  name: string
  title: string
  avatarUrl?: string
  avatarSeed: string
  bio: string
  banner: string | null
}

export const localProfile: LocalProfile = {
  name: "Joshua Dodofoli",
  title: "Page Turner",
  avatarSeed: "papyrbound-reader-01",
  bio: "",
  banner: defaultProfileBanner,
}
