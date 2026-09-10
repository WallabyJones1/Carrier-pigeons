import { Connection, PublicKey } from '@solana/web3.js';
import { publishEvent } from './api-client.mjs';

export async function runSolanaTracker() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const programIdText = process.env.SOLANA_PROGRAM_ID;
  if (!rpcUrl || !programIdText) throw new Error('SOLANA_RPC_URL and SOLANA_PROGRAM_ID are required in tracker mode');

  const connection = new Connection(rpcUrl, 'confirmed');
  const programId = new PublicKey(programIdText);
  console.log(`[worker] tracking Solana program ${programId.toBase58()}`);

  const subscriptionId = connection.onLogs(programId, async (logs, context) => {
    try {
      await publishEvent({
        type: 'chain:program-log',
        signature: logs.signature,
        slot: context.slot,
        err: logs.err,
        logs: logs.logs.slice(-12),
      });
    } catch (error) {
      console.error('[worker] failed to publish Solana log', error);
    }
  }, 'confirmed');

  const heartbeat = setInterval(async () => {
    try {
      const slot = await connection.getSlot('confirmed');
      const blockTime = await connection.getBlockTime(slot);
      await publishEvent({ type: 'chain:heartbeat', slot, blockTime, cluster: process.env.SOLANA_CLUSTER ?? 'devnet' });
    } catch (error) {
      console.error('[worker] tracker heartbeat failed', error);
    }
  }, 15_000);

  const stop = async () => {
    clearInterval(heartbeat);
    await connection.removeOnLogsListener(subscriptionId);
    process.exit(0);
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
