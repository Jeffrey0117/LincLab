import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'LincLab';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '聯盟行銷短連結管理平台';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `${siteName} - ${siteDescription}`,
  description: `${siteName} — 專為聯盟行銷打造的智能短網址服務。支援多帳號管理、點擊追蹤、自訂 OG 圖片，讓您的分潤連結轉換率翻倍！`,
  keywords: ["聯盟行銷", "分潤", "短網址", "轉換率優化", "OG圖片"],
  authors: [{ name: siteName }],
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    images: ['/logo.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
