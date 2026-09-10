import type { Metadata } from 'next';
import '@solana/wallet-adapter-react-ui/styles.css';
import './globals.css';
import { SolanaProvider } from '../components/SolanaProvider';

export const metadata: Metadata = {
  title: 'Carrier Pigeons — Race Network',
  description: 'Mint, race and track Carrier Pigeons on Solana.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
