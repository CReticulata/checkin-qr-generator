import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "活動報到 QR Code 生成器",
  description: "生成您的活動報到 QR Code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
