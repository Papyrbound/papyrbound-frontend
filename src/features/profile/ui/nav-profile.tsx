"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "@/features/profile/stores/account-store";
import { useReadingTitles } from "@/features/profile/model/reading-titles";
import { ReaderAvatar } from "./reader-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  ChevronsUpDownIcon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";

export function NavProfile() {
  const { profile } = useAccount();
  const { activeTitle } = useReadingTitles();
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
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
                  className="h-14 gap-3 px-3 py-2 aria-expanded:bg-muted [&_[data-slot=avatar]]:size-7"
                  tooltip={`${profile.name} · ${activeTitle}`}
                />
              }
            >
              <ReaderAvatar seed={profile.avatarSeed} size={28} />
              <div className="grid min-w-0 flex-1 text-left text-[13px] leading-[22px] group-data-[collapsible=icon]:hidden">
                <span className="truncate font-normal">{profile.name}</span>
                <span className="truncate text-[11px] leading-[18px] text-muted-foreground">
                  {activeTitle}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[272px]"
              side={isMobile ? "top" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="p-0 font-normal"
                  aria-label="Open profile"
                  onClick={() => navigate("/profile")}
                >
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
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/reading-titles")}>
                  <TrophyIcon />
                  Reading titles
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
    </>
  );
}
