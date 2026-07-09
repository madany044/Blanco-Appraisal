"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, RotateCcw, CheckCircle2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string | null) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "requesting" | "live" | "captured" | "denied">("idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

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
          resolve(); // give up after ~5s, capture() will guard anyway
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await waitForVideoReady(videoRef.current);
      }
      setStatus("live");
      setReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("denied");
      onCapture(null);
    }
  }, [onCapture, waitForVideoReady]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      alert("Camera not ready yet, please wait a second and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    setStatus("captured");
    onCapture(dataUrl);

    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [onCapture]);

  const retake = useCallback(() => {
    setPhoto(null);
    setStatus("idle");
    setReady(false);
    onCapture(null);
    startCamera();
  }, [onCapture, startCamera]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-[#1e2740] mb-1">Identity Verification</p>
      <p className="text-xs text-muted-foreground mb-3">
        Please enable your camera and take a quick photo to verify your identity. This image will be used solely for verification by office management and will not be shared, stored, or retained beyond this purpose.
      </p>

      {status === "idle" && (
        <Button type="button" onClick={startCamera} className="gap-2">
          <Camera className="h-4 w-4" /> Enable Camera & Verify
        </Button>
      )}

      {status === "requesting" && (
        <p className="text-sm text-muted-foreground">Requesting camera access…</p>
      )}

      {status === "denied" && (
        <Alert variant="destructive">
          <AlertDescription>
            Camera access is required to submit this form. Please allow camera permission in your browser
            settings and try again.
          </AlertDescription>
        </Alert>
      )}

      <div style={{ display: status === "live" ? "block" : "none" }} className="space-y-3">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xs rounded-md border bg-black"
          style={{ minHeight: 240 }}
        />
        <Button type="button" onClick={capture} disabled={!ready} className="gap-2">
          <Camera className="h-4 w-4" /> {ready ? "Capture Photo" : "Preparing camera…"}
        </Button>
      </div>

      {status === "captured" && photo && (
        <div className="space-y-3">
          <img src={photo} alt="Captured verification" className="w-full max-w-xs rounded-md border" />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Photo captured
            </span>
            <Button type="button" variant="outline" size="sm" onClick={retake} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Retake
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}