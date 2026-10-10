import type { Metadata } from "next";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SPADE-AI - Deep Learning Based Soil Property Estimation',
  description:
    'SPADE-AI: Deep Learning Based Soil Property Estimation from Smartphone Images through Spectral Reconstruction and Multi-Source Data Fusion for Crop Suitability Assessment',
  keywords: [
    'soil analysis',
    'deep learning',
    'agriculture',
    'AI',
    'crop recommendation',
    'smartphone',
    'hyperspectral',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
