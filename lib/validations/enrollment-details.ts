import { z } from "zod";

export const enrollmentDetailsSchema = z.object({
  whatsappNumber: z.string().trim().max(30).transform((value) => value.replace(/[\s()-]/g, ""))
    .refine((value) => value === "" || /^\+?[0-9]{7,15}$/.test(value), "Enter a valid WhatsApp number (7–15 digits, optionally starting with +).")
    .optional(),
  enrollmentStatus: z.enum(["New enrollment", "Re-Enrollment"]).optional(),
});
