import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import CartProvider from "@/components/CartProvider";
import ScrollToTopOnLoad from "@/components/ScrollToTopOnLoad";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

/** Elegant serif for headings — softer, more feminine art-gallery feel */
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  // Avoid unused `<link rel="preload">` warnings when body text uses Geist first.
  preload: false,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata = {
  title: "Shamrock Art Studio",
  description: "Next.js starter with Tailwind CSS and Firebase support.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="flex min-h-dvh flex-col overflow-x-clip bg-slate-950 font-sans text-stone-100"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <ScrollToTopOnLoad />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
