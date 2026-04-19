import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import { Toaster } from "sonner"; // Import the notification system

export const metadata: Metadata = {
  title: "Arc.Fun | Terminal",
  description: "Deploy and trade bonding curve assets on Arc Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased selection:bg-yellow-400 selection:text-black">
        <Providers>
          {/* Layout Wrapper */}
          <div className="relative min-h-screen flex flex-col">
            
            {/* 1. Global Navbar */}
            <Navbar /> 

            {/* 2. Main Content Area */}
            {/* Added flex-grow so the footer stays at the bottom on short pages */}
            <main className="flex-grow">
              {children}
            </main>

            {/* 3. Global Footer */}
            <Footer />

            {/* 4. Notification Toaster */}
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