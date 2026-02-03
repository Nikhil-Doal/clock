import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Nunito, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-segment",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ambient Clock - Beautiful Weather Dashboard",
  description: "A production-ready ambient clock with weather, AI summaries, and more. Perfect for desktops, tablets, and wall displays.",
  keywords: ["clock", "weather", "ambient", "dashboard", "smart display"],
  authors: [{ name: "Ambient Clock" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${nunito.variable} ${orbitron.variable} ${shareTechMono.variable} antialiased bg-ambient-dark`}
      >
        {children}
      </body>
    </html>
  );
}
