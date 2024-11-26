import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        <ErrorBoundary>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
