import type { Metadata } from "next";
import { AppHeader } from "@/app-shell/app-header";
import { AppSidebar } from "@/app-shell/app-sidebar";
import { ReadingListsProvider } from "@/features/reading-lists/stores/reading-lists-store";
import { CollectionsProvider } from "@/features/collections/stores/collections-store";
import { AnnotationsProvider } from "@/features/annotations/stores/annotations-store";
import { AppearanceProvider } from "@/features/profile/ui/appearance-provider";
import { ReadingMotionProvider } from "@/shared/ui/reading-motion";
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
        <AppearanceProvider>
          <ReadingMotionProvider>
          <ReadingListsProvider>
            <CollectionsProvider>
              <AnnotationsProvider>
                <TooltipProvider>
                  <SidebarProvider className="min-h-screen w-full">
                    <AppSidebar />
                    <SidebarInset className="min-w-0">
                      <AppHeader />
                      {children}
                    </SidebarInset>
                  </SidebarProvider>
                </TooltipProvider>
              </AnnotationsProvider>
            </CollectionsProvider>
          </ReadingListsProvider>
          </ReadingMotionProvider>
        </AppearanceProvider>
      </body>
    </html>
  );
}
