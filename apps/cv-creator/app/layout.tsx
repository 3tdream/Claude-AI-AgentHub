import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CV Creator — AI-Powered Resume Builder",
  description:
    "Create professional CVs in minutes with AI assistance. Multiple templates, smart content generation, and one-click PDF export.",
  keywords: ["CV builder", "resume creator", "AI resume", "PDF CV", "professional CV"],
  openGraph: {
    title: "CV Creator — AI-Powered Resume Builder",
    description:
      "Create professional CVs in minutes with AI assistance. Multiple templates, smart content generation, and one-click PDF export.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Creator — AI-Powered Resume Builder",
    description:
      "Create professional CVs in minutes with AI assistance.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${geistSans.variable} font-sans min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
