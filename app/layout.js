import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Retirement Fund Calculator",
  description: "Plan, project, and track your retirement savings.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full ${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
