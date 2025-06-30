import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SocialIcons from "@/components/SocialIcons";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast'
import { StoreProvider } from "@/store";

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
        <StoreProvider>
          <ScrollToTop />
          <Navbar />
          {children}
          <SocialIcons />
          <ToastContainer />
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}
