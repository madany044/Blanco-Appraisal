import * as faceapi from "face-api.js";

let loaded = false;

export async function loadFaceModels() {
  if (loaded) return;
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  loaded = true;
}

export async function getFaceDescriptor(input: HTMLVideoElement | HTMLImageElement): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection?.descriptor ?? null;
}

export function compareDescriptors(a: number[], b: Float32Array): { distance: number; isMatch: boolean } {
  const distance = faceapi.euclideanDistance(a, Array.from(b));
  return { distance, isMatch: distance < 0.5 }; // lower = stricter match
}