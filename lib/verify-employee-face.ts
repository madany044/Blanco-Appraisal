import { correctionsEnabled } from "./correction-config";
import { compareDescriptors } from "./face-api-loader";

export async function verifyEmployeeFace(employeeCode: string, descriptor: Float32Array, reference?: number[]) {
  if (!correctionsEnabled) {
    return compareDescriptors(reference ?? [], descriptor).isMatch;
  }
  const response = await fetch("/api/employee-session", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeCode, descriptor: Array.from(descriptor) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Verification failed. Please try again.");
  return data.verified === true;
}
