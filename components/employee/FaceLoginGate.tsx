"use client";

import { useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loadFaceModels, getFaceDescriptor, compareDescriptors } from "@/lib/face-api-loader";

export function FaceLoginGate({ onVerified }: { onVerified: (employeeCode: string) => void }) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "camera" | "checking" | "success" | "fail">("idle");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
          resolve(); // give up after ~5s, downstream capture will guard anyway
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }, []);

  async function startVerification() {
    if (!employeeCode) {
      setMessage("Enter your Employee Code first.");
      return;
    }
    setStatus("loading");
    setMessage("");
    setReady(false);
    try {
      await loadFaceModels();

      const res = await fetch(`/api/employee-profiles?employeeCode=${encodeURIComponent(employeeCode)}`);
      if (!res.ok) {
        setStatus("fail");
        setMessage("No enrolled profile found for this Employee Code. Contact HR.");
        return;
      }
      const profile = await res.json();

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;

      // Show the camera box first so the <video> element mounts in the DOM,
      // THEN attach the stream to the now-existing ref — fixes the black-screen bug
      setStatus("camera");
      await new Promise((r) => setTimeout(r, 0)); // let React render the video element

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
      console.error("Face verification camera error:", err);
      setStatus("fail");
      setMessage("Camera access denied or error occurred.");
    }
  }

  async function capture() {
    if (!videoRef.current || !ready) return;
    const video = videoRef.current;

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
        setTimeout(() => onVerified(employeeCode), 800);
      } else {
        setStatus("fail");
        setMessage(`Face did not match enrolled profile (distance ${distance.toFixed(2)}). Try again or contact HR.`);
      }
    } catch (err) {
      console.error("Face verification error:", err);
      setStatus("fail");
      setMessage("Verification failed. Please try again.");
    }
  }

  function retry() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("idle");
    setReady(false);
    setMessage("");
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">Face Verification</h2>
      <div>
        <Label>Employee Code</Label>
        <Input
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          disabled={status === "camera" || status === "checking"}
        />
      </div>

      <div style={{ display: status === "camera" || status === "checking" ? "block" : "none" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-md border bg-black"
          style={{ minHeight: 240 }}
        />
      </div>

      {status === "idle" || status === "loading" || status === "fail" ? (
        <Button onClick={startVerification} disabled={status === "loading"}>
          {status === "loading" ? "Starting camera…" : "Start Camera"}
        </Button>
      ) : null}

      {status === "camera" && (
        <div className="flex gap-2">
          <Button onClick={capture} disabled={!ready}>
            {ready ? "Verify My Identity" : "Preparing camera…"}
          </Button>
          <Button type="button" variant="outline" onClick={retry}>
            Cancel
          </Button>
        </div>
      )}

      {status === "checking" && (
        <Button disabled>Verifying…</Button>
      )}

      {message && (
        <p className={status === "fail" ? "text-red-600 text-sm" : "text-green-700 text-sm"}>{message}</p>
      )}
    </div>
  );
}