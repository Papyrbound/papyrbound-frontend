"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CheckCircle2Icon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";

/** shadcn Sonner adapter, using the app's existing theme tokens. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      closeButton
      icons={{ success: <CheckCircle2Icon className="size-4" />, info: <InfoIcon className="size-4" />, warning: <TriangleAlertIcon className="size-4" />, error: <OctagonXIcon className="size-4" />, loading: <Loader2Icon className="size-4 animate-spin" /> }}
      style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)", "--border-radius": "12px" } as React.CSSProperties}
      {...props}
    />
  );
}
