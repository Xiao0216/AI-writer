import type { Metadata } from "next";
import { Newsreader, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const headlineFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "600", "700"],
});

const bodyFont = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const labelFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-label",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "文枢AI",
  description: "面向中文长篇小说作者的创作控制站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${headlineFont.variable} ${bodyFont.variable} ${labelFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
