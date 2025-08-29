import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

//Importing Components
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

//Importing Font
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
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
      <body className={`${pressStart.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
