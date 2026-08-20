import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPA Tool - Workflow Editor",
  description: "Web Automation RPA Tool - Tạo kịch bản tự động hóa bằng kéo thả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
