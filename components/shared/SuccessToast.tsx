"use client";

import { useEffect } from "react";

interface SuccessToastProps {
  message: string;
  show: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function SuccessToast({
  message,
  show,
  onDismiss,
  duration = 4000,
}: SuccessToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [show, onDismiss, duration]);

  if (!show) return null;

  return (
    <div
      role="status"
      className="animate-success-toast"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#1a8c5a",
        color: "white",
        padding: "14px 20px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
        maxWidth: 420,
      }}
    >
      {message}
    </div>
  );
}
