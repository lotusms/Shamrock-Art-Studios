import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import ScrollToTopOnLoad from "@/components/ScrollToTopOnLoad";
import "./globals.css";

/** Elegant serif for headings — softer, more feminine art-gallery feel */
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shamrock Art Studio",
  description: "Next.js starter with Tailwind CSS and Firebase support.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-slate-950 font-sans text-stone-100"
        suppressHydrationWarning
      >
        <ScrollToTopOnLoad />
        {children}
      </body>
    </html>
  );
}
