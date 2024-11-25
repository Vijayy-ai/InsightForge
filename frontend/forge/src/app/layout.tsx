import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightForge - Data Analysis Platform",
  description: "Advanced data analysis and report generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
