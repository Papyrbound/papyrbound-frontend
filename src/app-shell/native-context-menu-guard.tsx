"use client";

import { useEffect } from "react";

export function NativeContextMenuGuard() {
  useEffect(() => {
    function preventNativeMenu(event: MouseEvent) {
      // Let custom menu handlers run before cancelling the browser's menu.
      event.preventDefault();
    }

    document.addEventListener("contextmenu", preventNativeMenu);
    return () => document.removeEventListener("contextmenu", preventNativeMenu);
  }, []);

  return null;
}
