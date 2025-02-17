import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DeChat | Decentralized AI Chat on Sonic",
  description:
    "DeChat - A decentralized AI-powered chat platform built on Sonic's high-performance blockchain. Experience the future of Web3 communication.",
  keywords:
    "DeChat, Sonic, DeFAI, Blockchain, AI Chat, Web3, Decentralized Messaging, Hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black`}>
        {children}
      </body>
    </html>
  );
}
