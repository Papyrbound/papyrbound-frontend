"use client";
import { Accordion as Primitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
export function Accordion(props: Primitive.Root.Props) {
  return <Primitive.Root data-slot="accordion" {...props} />;
}
export function AccordionItem(props: Primitive.Item.Props) {
  return <Primitive.Item data-slot="accordion-item" {...props} />;
}
export function AccordionTrigger({
  children,
  className,
  ...props
}: Primitive.Trigger.Props) {
  return (
    <Primitive.Header>
      <Primitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex w-full items-center text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-panel-open:rotate-180" />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}
export function AccordionContent({
  className,
  ...props
}: Primitive.Panel.Props) {
  return (
    <Primitive.Panel
      data-slot="accordion-content"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}
