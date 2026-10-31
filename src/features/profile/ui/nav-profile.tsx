"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { useRouter } from "next/navigation";
import { useAccount } from "@/features/profile/stores/account-store";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { ReaderAvatar } from "./reader-avatar";
import { EditProfileDialog } from "./edit-profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  BookOpenCheckIcon,
  ChevronsUpDownIcon,
  SettingsIcon,
  TrophyIcon,
  UserRoundPenIcon,
} from "lucide-react";

export function NavProfile() {
  const { profile } = useAccount();
  const { activeTitle } = useReadingTitles();
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const [editing, setEditing] = useLocalUIState(false);
  function navigate(path: string) {
    setOpenMobile(false);
    router.push(path);
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`${profile.name}, ${activeTitle}`}
              render={
                <SidebarMenuButton
                  size="lg"
                  className="h-10 gap-3 p-0 aria-expanded:bg-muted [&_[data-slot=avatar]]:size-7"
                  tooltip={`${profile.name} · ${activeTitle}`}
                />
              }
            >
              <ReaderAvatar seed={profile.avatarSeed} size={28} />
              <div className="grid min-w-0 flex-1 text-left text-[13px] leading-[22px] group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{profile.name}</span>
                <span className="truncate text-[11px] leading-[18px] text-muted-foreground">
                  {activeTitle}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[300px]"
              side={isMobile ? "top" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <ReaderAvatar seed={profile.avatarSeed} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {profile.name}
                      </p>
                      <p className="truncate text-[11px] leading-[18px] text-muted-foreground">
                        {activeTitle}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <UserRoundPenIcon />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reading-titles")}>
                  <TrophyIcon />
                  Reading titles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reading-activity")}>
                  <BookOpenCheckIcon />
                  Reading activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {editing && <EditProfileDialog onClose={() => setEditing(false)} />}
    </>
  );
}
