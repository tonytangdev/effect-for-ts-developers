import type { Metadata } from "next";
import { IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Effect TS — A Course for TypeScript Developers",
    template: "%s | Effect TS Course",
  },
  description:
    "A structured learning path for TypeScript developers to master Effect TS — from mental models to advanced concurrency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen font-mono">{children}</body>
    </html>
  );
}
