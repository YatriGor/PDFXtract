import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDFXtract",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Add viewport meta tag for responsive design */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <Providers>
            {/* Main content takes up remaining space */}
            <main className="flex-grow">
              {children}
            </main>
            {/* Toaster for notifications */}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}