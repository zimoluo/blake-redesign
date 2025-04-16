import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import BackgroundGradient from "@/components/ui/background/background-gradient";
import Navbar from "@/components/ui/navbar/navbar";

const mainFont = Lato({
  variable: "--font-main",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "The William Blake Archive",
  description: "Experimental rewrite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mainFont.variable} antialiased text-primary`}>
        <BackgroundGradient />
        <Navbar />
        <div className="min-h-[90svh]">{children}</div>
        {/* Footer will be here */}
      </body>
    </html>
  );
}
