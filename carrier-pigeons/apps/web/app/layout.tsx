import type { Metadata } from 'next';
import { SolanaProvider } from '../components/SolanaProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carrier Pigeons - Global Delivery Network',
  description: 'Mission Control Dashboard for the Carrier Pigeons Race Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}

