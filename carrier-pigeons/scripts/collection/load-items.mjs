import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { addConfigLines, fetchCandyMachine, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';

const resolveHome = (value) => value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value;
const configPath = process.env.DROP_CONFIG ?? './config/drop.devnet.example.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const state = JSON.parse(await fs.readFile('.generated/drop-state.json', 'utf8'));
const keypairFile = process.env.SOLANA_DEPLOYER_KEYPAIR;
if (!keypairFile) throw new Error('Set SOLANA_DEPLOYER_KEYPAIR.');

const umi = createUmi(config.rpcUrl).use(mplCore()).use(mplCandyMachine());
const secret = JSON.parse(await fs.readFile(resolveHome(keypairFile), 'utf8'));
const kp = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
umi.use(keypairIdentity(createSignerFromKeypair(umi, kp)));

const candyMachine = publicKey(state.candyMachine);
let machine = await fetchCandyMachine(umi, candyMachine);
let index = Number(machine.itemsLoaded ?? 0);
const batchSize = Math.max(1, Math.min(20, Number(process.env.CANDY_BATCH_SIZE ?? 8)));

while (index < config.itemsAvailable) {
  const end = Math.min(config.itemsAvailable, index + batchSize);
  const configLines = [];
  for (let i = index; i < end; i += 1) {
    const ordinal = i + 1;
    const id = String(ordinal).padStart(4, '0');
    // With prefixes configured on the Candy Machine, only suffixes are inserted here.
    configLines.push({ name: id, uri: `${id}.json` });
  }
  await addConfigLines(umi, { candyMachine, index, configLines }).sendAndConfirm(umi);
  index = end;
  console.log(`Loaded ${index}/${config.itemsAvailable}`);
}

machine = await fetchCandyMachine(umi, candyMachine);
console.log(`Done. itemsLoaded=${machine.itemsLoaded}, itemsAvailable=${machine.data?.itemsAvailable ?? config.itemsAvailable}`);
