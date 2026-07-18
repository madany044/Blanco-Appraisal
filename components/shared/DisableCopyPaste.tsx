"use client";

import { useEffect } from "react";

export function DisableCopyPaste() {
  useEffect(() => {
    const block = (e: ClipboardEvent | Event) => e.preventDefault();

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block); // optional: also blocks right-click menu

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);
    };
  }, []);

  return null;
}