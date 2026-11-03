import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { GeistSerifHeart } from "geist/font/serif/heart";
import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

// The hand's stand-in face (design.md section 4), until Selva's handwriting is scanned.
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker" });

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSerifRegular.variable} ${GeistSerifHeart.variable} ${GeistSans.variable} ${GeistMono.variable} ${marker.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
