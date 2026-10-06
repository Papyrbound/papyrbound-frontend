import type { Metadata } from "next";
import { AppSidebar } from "@/components/navbar/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papyrbound",
  description: "A desktop reader for EPUB books and CBZ comics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "antialiased")}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarProvider className="grid min-h-screen w-full grid-cols-[auto_minmax(0,1fr)]">
            <AppSidebar />
            <SidebarInset className="min-w-0">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
