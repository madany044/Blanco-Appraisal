"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

export function VerificationPhotoButton({ photoUrl }: { photoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!photoUrl) return null;

  async function handleOpen() {
  if (!photoUrl) return;
  setLoading(true);
  setOpen(true);
  try {
    const supabase = createClient();
    const path = photoUrl.split("/verification-photos/")[1];
    if (!path) throw new Error("Invalid photo path");

    const { data, error } = await supabase.storage
      .from("verification-photos")
      .createSignedUrl(path, 60 * 5);
    if (error) throw error;
    setSignedUrl(data.signedUrl);
  } catch (e) {
    console.error("Failed to load photo:", e);
  } finally {
    setLoading(false);
  }
}

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        title="View verification photo"
      >
        <Camera className="h-3.5 w-3.5" />
        Photo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-sm rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-sm font-semibold">Identity Verification Photo</p>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : signedUrl ? (
              <img src={signedUrl} alt="Verification" className="rounded-md w-full" />
            ) : (
              <p className="text-sm text-red-600">Failed to load photo.</p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-md border py-1.5 text-sm hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}