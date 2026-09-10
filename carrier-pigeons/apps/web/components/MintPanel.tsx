'use client';

import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, publicKey, some } from '@metaplex-foundation/umi';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { mintV1, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';

export function MintPanel() {
  const wallet = useWallet();
  const [status, setStatus] = useState('');
  const [mintedAsset, setMintedAsset] = useState('');
  const [busy, setBusy] = useState(false);
  const candyMachine = process.env.NEXT_PUBLIC_CORE_CANDY_MACHINE_ADDRESS || '';
  const collection = process.env.NEXT_PUBLIC_CORE_COLLECTION_ADDRESS || '';
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const mintLimitId = Number(process.env.NEXT_PUBLIC_MINT_LIMIT_ID || 1);
  const paymentDestination = process.env.NEXT_PUBLIC_MINT_PAYMENT_DESTINATION || '';
  const configured = Boolean(candyMachine && collection);

  const shortWallet = useMemo(() => {
    const text = wallet.publicKey?.toBase58();
    return text ? `${text.slice(0, 4)}…${text.slice(-4)}` : 'Not connected';
  }, [wallet.publicKey]);

  async function mint() {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus('Connect a Solana wallet first.');
      return;
    }
    if (!configured) {
      setStatus('Devnet Candy Machine addresses have not been configured yet.');
      return;
    }

    setBusy(true);
    setStatus('Preparing mint transaction…');
    try {
      const umi = createUmi(rpc)
        .use(mplCore())
        .use(mplCandyMachine())
        .use(walletAdapterIdentity(wallet));
      const asset = generateSigner(umi);
      setStatus('Approve the mint in your wallet…');
      await mintV1(umi, {
        candyMachine: publicKey(candyMachine),
        asset,
        collection: publicKey(collection),
        mintArgs: {
          mintLimit: some({ id: mintLimitId }),
          ...(paymentDestination
            ? { solPayment: some({ destination: publicKey(paymentDestination) }) }
            : {}),
        },
      }).sendAndConfirm(umi);
      setMintedAsset(asset.publicKey.toString());
      setStatus('Mint confirmed on Solana. Your pigeon is ready for registration.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Mint failed: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel mint-panel">
      <div className="eyebrow">SOLANA MINT TERMINAL</div>
      <div className="mint-grid">
        <div>
          <h2>Dispatch your pigeon</h2>
          <p className="muted">Core NFT minting from the collection page. Devnet first, mainnet only after the drop and race stack passes Season Zero.</p>
          <div className="mint-stats">
            <span><strong>5,000</strong> supply target</span>
            <span><strong>Core</strong> asset standard</span>
            <span><strong>1</strong> mint limit ID</span>
          </div>
        </div>
        <div className="mint-actions">
          <WalletMultiButton />
          <div className="wallet-readout">Wallet <strong>{shortWallet}</strong></div>
          <button className="primary-button" disabled={!wallet.connected || busy || !configured} onClick={mint}>
            {busy ? 'Minting…' : configured ? 'Mint Carrier Pigeon' : 'Candy Machine not configured'}
          </button>
          {status && <p className="status" aria-live="polite">{status}</p>}
          {mintedAsset && <code className="asset-code">{mintedAsset}</code>}
        </div>
      </div>
    </section>
  );
}
