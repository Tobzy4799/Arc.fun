import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import { Toaster } from "sonner"; 
import { Inter } from 'next/font/google'

// 1. Font Configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// 2. Professional Metadata (for SEO and Social Sharing)
export const metadata: Metadata = {
  title: 'ARC.FUN TERMINAL | Secure Coin Launchpad',
  description: 'Launch and trade secure tokens on the Arc Network via our advanced bonding curve terminal.',
  icons: {
    icon: '/favicon.ico', 
    apple: '/apple-icon.png', 
  },
  openGraph: {
    title: 'ARC.FUN | Launch Your Coin',
    description: 'The matrix terminal for the Arc Network. Create tokens on a bonding curve in one click.',
    url: 'https://your-app-vercel-url.vercel.app', // Update this once you have your real Vercel URL
    siteName: 'ARC.FUN',
    images: [
      {
        url: '/logo.png', 
        width: 1200, 
        height: 630,
        alt: 'ARC.FUN Terminal Logo'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      {/* 3. Applying the font variable and your custom yellow selection styling */}
      <body className={`${inter.variable} bg-black text-white antialiased selection:bg-yellow-400 selection:text-black font-sans`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            
            <Navbar /> 

            {/* Main Content Area with flex-grow to keep footer at bottom */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />

            <Toaster 
              theme="dark" 
              position="bottom-right" 
              richColors 
              closeButton
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}