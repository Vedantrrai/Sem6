import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "KaamOn",
  description: "Local Workers Booking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Chatbot />
        <Toaster richColors position="top-center" /> {/* <-- Add this component */}
      </body>
    </html>
  );
}