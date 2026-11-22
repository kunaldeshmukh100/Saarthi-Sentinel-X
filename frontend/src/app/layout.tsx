import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Saarthi Sentinel X — Unified AI Safety & Emergency Intelligence",
  description: "A multimodal, offline-first AI safety system that detects danger, assists victims, and orchestrates response across disaster, medical, and personal safety scenarios in real-time.",
  keywords: ["AI safety", "emergency response", "women safety", "medical AI", "disaster response", "offline emergency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e1a] text-slate-100 min-h-screen bg-grid">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
