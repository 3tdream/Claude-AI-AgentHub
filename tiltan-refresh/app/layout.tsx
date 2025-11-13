import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tiltan College of Design | Leading Design School in Haifa",
  description: "Tiltan College of Design offers professional programs in Graphic Design, Interior Design, Game Development, 3D Design, Animation, and more. Founded in 1994.",
  keywords: ["design school", "graphic design", "interior design", "game development", "3D design", "animation", "tiltan", "haifa"],
  authors: [{ name: "Tiltan College" }],
  openGraph: {
    title: "Tiltan College of Design",
    description: "Leading design and visual communication college in Haifa, Israel",
    type: "website",
    locale: "en_US",
    alternateLocale: "he_IL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
