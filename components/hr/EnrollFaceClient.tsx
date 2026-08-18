"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, RotateCcw, CheckCircle2 } from "lucide-react";
import { loadFaceModels, getFaceDescriptor } from "@/lib/face-api-loader";
import { createClient } from "@/lib/supabase/client";

const ENROLLED_BY_OPTIONS = [
  "Enroller 1",
  "Enroller 2",
  "Enroller 3",
  "Enroller 4",
  "Enroller 5",
  "Enroller 6",
];

export function EnrollFaceClient() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [enrolledBy, setEnrolledBy] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "captured" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadFaceModels();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
    if (!employeeCode || !employeeName || !enrolledBy) {
      setMessage("Please enter Employee Code, Name, and select Enrolled By first.");
      return;
    }
    setStatus("starting");
    setMessage("");
    setReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;

      setStatus("live");
      await new Promise((r) => setTimeout(r, 0)); // let the video element mount

      if (!videoRef.current) {
        setStatus("error");
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
      setStatus("error");
      setMessage("Camera access denied or error occurred.");
    }
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setMessage("Camera not ready yet, please wait a second and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setPhoto(dataUrl);
    setStatus("captured");
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function retake() {
    setPhoto(null);
    setStatus("idle");
    setReady(false);
    setMessage("");
  }

  async function handleEnroll() {
    if (!photo) {
      setMessage("Please capture a photo first.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const img = new Image();
      img.src = photo;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const descriptor = await getFaceDescriptor(img);
      if (!descriptor) {
        setStatus("error");
        setMessage("No face detected in the captured photo. Please retake with a clearer, front-facing shot.");
        return;
      }

      const res = await fetch(photo);
      const blob = await res.blob();

      const supabase = createClient();
      const fileName = `${employeeCode}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("employee-reference-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("employee-reference-photos")
        .getPublicUrl(fileName);

      const saveRes = await fetch("/api/employee-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCode,
          employeeName,
          referencePhotoUrl: urlData.publicUrl,
          faceDescriptor: Array.from(descriptor),
          enrolledBy,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save profile");

      setStatus("done");
      setMessage(`Enrolled ${employeeName} successfully.`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Enrollment failed");
    }
  }

  function resetForm() {
    setEmployeeCode("");
    setEmployeeName("");
    setEnrolledBy("");
    setPhoto(null);
    setStatus("idle");
    setReady(false);
    setMessage("");
  }

  const lockFields = status === "live" || status === "captured" || status === "saving";

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Enroll for New Employees</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture a clear, front-facing live photo to enroll this employee for face verification.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Employee Code</Label>
          <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} disabled={lockFields} />
        </div>
        <div>
          <Label>Employee Name</Label>
          <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} disabled={lockFields} />
        </div>
        <div>
          <Label>Enrolled By</Label>
          <Select value={enrolledBy} onValueChange={setEnrolledBy} disabled={lockFields}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select who is enrolling this employee" />
            </SelectTrigger>
            <SelectContent>
              {ENROLLED_BY_OPTIONS.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Reference Photo</Label>

        {status === "idle" || status === "starting" || status === "error" ? (
          <Button type="button" className="mt-2 w-full gap-2" onClick={startCamera} disabled={status === "starting"}>
            <Camera className="h-4 w-4" /> {status === "starting" ? "Starting camera…" : "Enable Camera"}
          </Button>
        ) : null}

        <div style={{ display: status === "live" ? "block" : "none" }} className="mt-2 space-y-2">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-md border bg-black"
            style={{ minHeight: 240 }}
          />
          <Button type="button" onClick={capture} disabled={!ready} className="w-full gap-2">
            <Camera className="h-4 w-4" /> {ready ? "Capture Photo" : "Preparing camera…"}
          </Button>
        </div>

        {status === "captured" && photo && (
          <div className="mt-2 space-y-2">
            <img src={photo} alt="Captured reference" className="w-full rounded-md border" />
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

      {status === "done" ? (
        <Button type="button" variant="secondary" className="w-full" onClick={resetForm}>
          Enroll Another Employee
        </Button>
      ) : (
        <Button className="w-full" onClick={handleEnroll} disabled={!photo || status === "saving"}>
          {status === "saving" ? "Enrolling…" : "Enroll Face"}
        </Button>
      )}

      {message && (
        <p className={status === "error" ? "text-sm text-red-600" : "text-sm text-green-700"}>{message}</p>
      )}
    </div>
  );
}