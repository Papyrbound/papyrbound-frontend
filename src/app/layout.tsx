import type { Metadata } from "next";
import { AppHeader } from "@/app-shell/app-header";
import { AppSidebar } from "@/app-shell/app-sidebar";
import { ReadingListsProvider } from "@/features/reading-lists/stores/reading-lists-store";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Papyrbound",
  description: "A desktop reader for EPUB books and CBZ comics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ReadingListsProvider>
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="min-w-0">
                <AppHeader />
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </ReadingListsProvider>
      </body>
    </html>
  );
}
