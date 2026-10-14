import { localCorrectionTest } from "@/lib/correction-config";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blanco Steel — Employee Progress Report Card",
  description:
    "Blanco Steel Detailing Services Private Limited — Salary Appraisal System FY 2026-27",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{localCorrectionTest && <div className="bg-amber-100 border-b border-amber-300 p-2 text-center text-sm font-semibold">Local correction test — appraisals and photos are stored only in the test database</div>}{children}</body>
    </html>
  );
}
