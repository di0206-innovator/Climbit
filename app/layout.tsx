import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/react";
import { WebVitals } from "../components/WebVitals";
import "./globals.css";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport = {
  themeColor: "#00CC66",
};

export const metadata: Metadata = {
  title: "Climbit | Personalised Carbon Awareness Decision Engine",
  description: "Understand your carbon footprint, identify high-impact lifestyle habits, and discover the single best climate action to take next based on ROI, cost, and effort.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Climbit",
  },
  openGraph: {
    title: "Climbit | AI Climate Decision Engine",
    description: "Discover the single highest-ROI climate action tailored for your lifestyle.",
    url: "https://climbit.app",
    siteName: "Climbit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Climbit",
    description: "The AI Climate Decision Engine.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Header />
          {children}
          <Analytics />
          <WebVitals />
          <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        </ClerkProvider>
      </body>
    </html>
  );
}
