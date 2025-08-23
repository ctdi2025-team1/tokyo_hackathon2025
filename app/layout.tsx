// biome-ignore assist/source/organizeImports: keep import order for clarity
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomThemeProvider from './components/ThemeProvider';
import EmotionRegistry from './components/EmotionRegistry';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "環境データ＆イベント情報",
  description: "渋谷区の家庭ごみ・資源回収KPIと今日開催中のイベント情報を一覧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EmotionRegistry>
          <CustomThemeProvider>
            {children}
          </CustomThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
