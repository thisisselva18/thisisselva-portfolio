import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { GeistSerifHeart } from "geist/font/serif/heart";
import "./globals.css";

// Metadata (title, description) comes from src/content/site.ts in Phase 2.

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSerifRegular.variable} ${GeistSerifHeart.variable} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
