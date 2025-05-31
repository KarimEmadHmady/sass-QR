import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubdomainProvider } from "../contexts/SubdomainContext";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SocialIcons from "@/components/SocialIcons";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Code Menu",
  description: "Digital menu system with QR codes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SubdomainProvider>
          <AuthProvider>
            <LanguageProvider>
              <ScrollToTop />
              <Navbar />
              {children}
              <SocialIcons />
              <ToastContainer />
              <Toaster position="top-center" />
            </LanguageProvider>
          </AuthProvider>
        </SubdomainProvider>
      </body>
    </html>
  );
}
