import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import "./globals.css";
import BackgroundGradient from "@/components/ui/root-layout/background-gradient";
import Navbar from "@/components/ui/root-layout/navbar";
import Footer from "@/components/ui/root-layout/footer";
import { NavbarControlProvider } from "@/components/context/navbar-control-context";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/components/context/settings-context";

const mainFont = Inter({
  variable: "--font-main",
  subsets: ["latin"],
});

const logoFont = Lato({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "400",
});

const environment = (process.env.VERCEL_ENV ?? "development").toLowerCase();

export const metadata: Metadata = {
  title: "The William Blake Archive",
  description: "Experimental rewrite",
  icons: [
    {
      rel: "icon",
      url: `/website-favicon/${environment}/favicon-32x32.png`,
      type: "image/png",
      sizes: "32x32",
    },
    {
      rel: "icon",
      url: `/website-favicon/${environment}/favicon-96x96.png`,
      type: "image/png",
      sizes: "96x96",
    },
    {
      rel: "icon",
      url: `/website-favicon/${environment}/favicon-192x192.png`,
      type: "image/png",
      sizes: "192x192",
    },
    {
      rel: "icon",
      url: `/website-favicon/${environment}/favicon-1024x1024.png`,
      type: "image/png",
      sizes: "1024x1024",
    },
    {
      rel: "apple-touch-icon",
      url: `/website-favicon/${environment}/favicon-180x180.png`,
      type: "image/png",
      sizes: "180x180",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mainFont.variable} ${logoFont.variable} antialiased text-primary font-main`}
      >
        <ThemeProvider>
          <SettingsProvider>
            <NavbarControlProvider>
              <BackgroundGradient />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="mb-12 mt-19">
                  <main>{children}</main>
                </div>
                <div className="flex-grow pointer-events-none select-none invisible" />
                <Footer />
              </div>
            </NavbarControlProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
