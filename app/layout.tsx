import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

//Importing Components
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Staging from "@/components/Staging";

//Importing Font
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "900"], // Only load weights used in Figma design
});

export const metadata: Metadata = {
  title: "Opac Home",
  description: "This is the home page of Opac",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} antialiased`}>
        <Staging />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
