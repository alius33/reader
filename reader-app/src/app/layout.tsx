import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import InstallPrompt from "@/components/InstallPrompt";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reader — Book Summary Library",
  description: "A personal library of comprehensive book summaries",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reader",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e1e1e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors />
        <InstallPrompt />
      </body>
    </html>
  );
}
