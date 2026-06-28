import type { Metadata } from 'next';
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FINEXUS - AI Investment Research Agent',
    template: '%s | FINEXUS',
  },
  description: 'AI-powered investment research and analysis for stocks. Get real-time BUY/SELL/HOLD recommendations with 3-phase analysis.',
  keywords: ['investment', 'AI research', 'stocks', 'FINEXUS', 'stock analysis', 'investment agent'],
  authors: [{ name: 'FINEXUS' }],
  creator: 'FINEXUS',
  publisher: 'FINEXUS',
  openGraph: {
    title: 'FINEXUS - AI Investment Research Agent',
    description: 'AI-powered investment research and analysis for stocks',
    url: 'https://finexus.ai',
    siteName: 'FINEXUS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FINEXUS - AI Investment Research Agent',
    description: 'AI-powered investment research and analysis for stocks',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}