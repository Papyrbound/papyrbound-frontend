"use client";
import { Suspense, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Library, Highlighter, Heart, Folder, Bookmark, CircleCheck } from "lucide-react";
import { NavProfile } from "@/features/profile/ui/nav-profile";
import { BookSearchDialog } from "@/features/home/ui/book-search-dialog";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/shared/ui/sidebar";
const navigation = [{label: "Reading Now", href: "/", icon: BookOpen}, {label: "Library", href: "/library", icon: Library}, {label: "Annotations", href: "/annotations", icon: Highlighter}];
const shelves = [{label: "Favourites", href: "/reading-lists?list=favourites", icon: Heart}, {label: "Collections", href: "/collections", icon: Folder}, {label: "Want to Read", href: "/reading-lists?list=want-to-read", icon: Bookmark}, {label: "Finished", href: "/reading-lists?list=completed", icon: CircleCheck}];
function Navigation() {
 const path=usePathname(); const search=useSearchParams(); const {setOpenMobile}=useSidebar();
 function links(items: typeof navigation) {return <SidebarMenu>{items.map(({label,href,icon: Icon})=><SidebarMenuItem key={href}><SidebarMenuButton className="h-9 rounded-lg px-3 text-[13px]" isActive={href.includes("?") ? path+"?"+search.toString()===href : path===href} render={<Link href={href} onClick={()=>setOpenMobile(false)}/>}><Icon className="size-4 text-muted-foreground" strokeWidth={1.5}/><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>}
 return <><div className="px-3">{links(navigation)}</div><div className="mt-6 px-3"><p className="mb-3 px-3 text-xs text-muted-foreground">Shelves</p>{links(shelves)}</div></>;
}
export function AppSidebar(props: ComponentProps<typeof Sidebar>) {return <Sidebar collapsible="offcanvas" {...props}><SidebarHeader className="gap-5 px-3 pb-4 pt-5"><Link href="/" className="px-3 text-lg font-semibold tracking-tight">Papyrbound</Link><BookSearchDialog/></SidebarHeader><SidebarContent><Suspense><Navigation/></Suspense></SidebarContent><SidebarFooter><NavProfile/></SidebarFooter></Sidebar>}
