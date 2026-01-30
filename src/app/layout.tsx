import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro - Time Tracker",
  description: "Personal time tracking with pomodoro technique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#1a1a1a]`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-[#222] overflow-auto">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
