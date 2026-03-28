import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OpenAI Realtime API Demo",
  description: "A streamlined demo of OpenAI's Realtime API using WebRTC for real-time voice AI applications.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh bg-background font-sans antialiased",
          heebo.variable
        )}
        suppressHydrationWarning
      >
        <div className="relative flex min-h-dvh flex-col bg-background items-center">
          <Header />
          <main className="flex flex-1 justify-center items-start">
            {children}
          </main>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
