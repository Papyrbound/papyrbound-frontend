"use client";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
export function DemoIndicator() {
  const showDemo = useSettingsUI((state) => state.showDemo);
  if (!showDemo) return null;
  return <Popover><PopoverTrigger render={<Button size="sm" variant="secondary" />} aria-label="Demo content is visible">Demo</PopoverTrigger><PopoverContent className="w-64 space-y-3"><p className="text-sm">Fictional sample content is visible alongside your library. Samples do not unlock reading titles.</p><Button size="sm" onClick={() => useSettingsUI.getState().patch({ showDemo: false })}>Hide demo content</Button></PopoverContent></Popover>;
}
