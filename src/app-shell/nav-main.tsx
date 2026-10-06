"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { NavigationItem } from "@/app-shell/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: NavigationItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items?.length ? (
            <Collapsible key={item.title} defaultOpen={pathname.startsWith(item.url)} className="group/collapsible" render={<SidebarMenuItem />}>
              <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} className="transition-colors hover:bg-sidebar-accent/70 hover:text-foreground data-open:bg-sidebar-accent data-open:text-foreground" />}>
                <item.icon />
                <span>{item.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton render={<Link href={subItem.url} />}><span>{subItem.title}</span></SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname === item.url} tooltip={item.title} className="transition-colors hover:bg-sidebar-accent/70 hover:text-foreground" >
                <item.icon className="stroke-muted-foreground" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
