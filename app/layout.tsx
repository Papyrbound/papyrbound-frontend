import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppSidebar } from "@/components/navbar/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import "./globals.css";

const haffer = localFont({
  src: "./font/HafferXH-TRIAL-Regular.otf",
  variable: "--font-haffer",
  weight: "350",
  display: "swap",
});

const hafferMono = localFont({
  src: "./font/HafferMono-TRIAL-Regular.otf",
  variable: "--font-haffer-mono",
  weight: "350",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Papyrbound",
  description: "A desktop reader for EPUB books and CBZ comics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", haffer.variable, hafferMono.variable)}
    >
      <body className={cn("min-h-full flex flex-col", haffer.className)}>
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
