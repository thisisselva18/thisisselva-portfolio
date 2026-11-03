import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { GeistSerifHeart } from "geist/font/serif/heart";
import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import { site } from "@/content/site";
import "lenis/dist/lenis.css";
import "./globals.css";

// The hand's stand-in face (design.md section 4), until Selva's handwriting is scanned.
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker" });

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

// Scroll mode's motion hides each card and note until its turn (materials.css). This runs before
// the first paint, so nothing shows and then vanishes. If the motion code hasn't started within
// 4 seconds (it failed to load), it gives up and everything is simply shown. No script, no hiding.
const MOTION_GATE = `(function(){var d=document.documentElement;d.dataset.motion="on";setTimeout(function(){if(d.dataset.motion!=="ready")delete d.dataset.motion},4000)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSerifRegular.variable} ${GeistSerifHeart.variable} ${GeistSans.variable} ${GeistMono.variable} ${marker.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
