"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle2, RotateCcw } from "lucide-react";
import { loadFaceModels, getFaceDescriptor, compareDescriptors } from "@/lib/face-api-loader";

interface FinalFaceVerificationProps {
  employeeCode: string;
  onVerified: (capturedPhotoDataUrl: string | null) => void;
}

export function FinalFaceVerification({ employeeCode, onVerified }: FinalFaceVerificationProps) {
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "checking" | "success" | "fail">("idle");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const waitForVideoReady = useCallback((video: HTMLVideoElement) => {
    return new Promise<void>((resolve) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }
        if (attempts > 50) {
          resolve();
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }, []);

  async function startCamera() {
    if (!employeeCode) {
      setMessage("Employee code not found. Please restart the form.");
      return;
    }
    setStatus("starting");
    setMessage("");
    setReady(false);
    try {
      await loadFaceModels();

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;

      setStatus("live");
      await new Promise((r) => setTimeout(r, 0));

      if (!videoRef.current) {
        setStatus("fail");
        setMessage("Camera preview failed to initialize. Please try again.");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await waitForVideoReady(videoRef.current);
      setReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("fail");
      setMessage("Camera access denied or error occurred.");
    }
  }

  async function verify() {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setMessage("Camera not ready yet, please wait a second and try again.");
      return;
    }

    setStatus("checking");
    setMessage("");
    try {
      const res = await fetch(`/api/employee-profiles?employeeCode=${encodeURIComponent(employeeCode)}`);
      if (!res.ok) {
        setStatus("fail");
        setMessage("No enrolled profile found for this Employee Code. Contact HR.");
        return;
      }
      const profile = await res.json();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const liveDescriptor = await getFaceDescriptor(video);
      streamRef.current?.getTracks().forEach((t) => t.stop());

      if (!liveDescriptor) {
        setStatus("fail");
        setMessage("Could not detect your face clearly. Try again.");
        return;
      }

      const { isMatch, distance } = compareDescriptors(profile.faceDescriptor, liveDescriptor);
      if (isMatch) {
        setStatus("success");
        setMessage("Identity verified.");
        onVerified(dataUrl);
      } else {
        setStatus("fail");
        setMessage(`Face did not match your enrolled profile (distance ${distance.toFixed(2)}). Please try again.`);
        onVerified(null);
      }
    } catch (err) {
      console.error("Final verification error:", err);
      setStatus("fail");
      setMessage("Verification failed. Please try again.");
      onVerified(null);
    }
  }

  function retry() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("idle");
    setReady(false);
    setMessage("");
    onVerified(null);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-[#1e2740]">Final Identity Verification</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Please verify your face one more time to confirm you are submitting this form yourself.
      </p>

      {(status === "idle" || status === "fail") && (
        <Button type="button" onClick={startCamera} className="gap-2">
          <Camera className="h-4 w-4" /> Start Verification
        </Button>
      )}

      {status === "starting" && <p className="text-sm text-muted-foreground">Starting camera…</p>}

      <div style={{ display: status === "live" || status === "checking" ? "block" : "none" }} className="space-y-3">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xs rounded-md border bg-black"
          style={{ minHeight: 220 }}
        />
        <Button type="button" onClick={verify} disabled={!ready || status === "checking"} className="gap-2">
          <Camera className="h-4 w-4" />
          {status === "checking" ? "Verifying…" : ready ? "Verify My Identity" : "Preparing camera…"}
        </Button>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Identity verified
          </span>
          <Button type="button" variant="outline" size="sm" onClick={retry} className="gap-1">
            <RotateCcw className="h-3 w-3" /> Re-verify
          </Button>
        </div>
      )}

      {status === "fail" && message && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}