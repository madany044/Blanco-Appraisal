"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmSubmitModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  submitting?: boolean;
}

export function ConfirmSubmitModal({
  open,
  title = "Confirm submission",
  description = "Please confirm that you are ready to submit this form. Once submitted, it will move to the next stage.",
  confirmLabel = "Yes, Submit",
  onClose,
  onConfirm,
  submitting = false,
}: ConfirmSubmitModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            aria-label="Close submit confirmation"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={() => {
              void onConfirm();
            }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
