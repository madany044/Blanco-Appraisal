"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loadFaceModels, getFaceDescriptor } from "@/lib/face-api-loader";
import { createClient } from "@/lib/supabase/client";

export function EnrollFaceClient() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadFaceModels();
  }, []);

  async function handleEnroll() {
    if (!file || !employeeCode || !employeeName) {
      setMessage("Please fill all fields and choose a photo.");
      return;
    }
    setStatus("loading");
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;
      await new Promise((res) => (img.onload = res));

      const descriptor = await getFaceDescriptor(img);
      if (!descriptor) {
        setStatus("error");
        setMessage("No face detected in the photo. Try a clearer front-facing photo.");
        return;
      }

      const supabase = createClient();
      const fileName = `${employeeCode}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("employee-reference-photos")
        .upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("employee-reference-photos")
        .getPublicUrl(fileName);

      const res = await fetch("/api/employee-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCode,
          employeeName,
          referencePhotoUrl: urlData.publicUrl,
          faceDescriptor: Array.from(descriptor),
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");

      setStatus("done");
      setMessage(`Enrolled ${employeeName} successfully.`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Enrollment failed");
    }
  }

  return (
    <div className="max-w-md space-y-4 rounded-lg border bg-white p-6">
      <div>
        <Label>Employee Code</Label>
        <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
      </div>
      <div>
        <Label>Employee Name</Label>
        <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
      </div>
      <div>
        <Label>Reference Photo (clear front-facing)</Label>
        <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button onClick={handleEnroll} disabled={status === "loading"}>
        {status === "loading" ? "Enrolling…" : "Enroll Face"}
      </Button>
      {message && <p className={status === "error" ? "text-red-600 text-sm" : "text-green-700 text-sm"}>{message}</p>}
    </div>
  );
}