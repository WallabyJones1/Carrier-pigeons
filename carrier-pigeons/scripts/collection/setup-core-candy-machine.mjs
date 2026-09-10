import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  createSignerFromKeypair,
  dateTime,
  generateSigner,
  keypairIdentity,
  publicKey,
  sol,
  some,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createCollection, mplCore, ruleSet } from '@metaplex-foundation/mpl-core';
import { create, mplCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';

function resolveHome(value) {
  return value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value;
}

async function loadIdentity(umi, filename) {
  const bytes = JSON.parse(await fs.readFile(resolveHome(filename), 'utf8'));
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(bytes));
  return createSignerFromKeypair(umi, keypair);
}

const configPath = process.env.DROP_CONFIG ?? './config/drop.devnet.example.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const keypairFile = process.env.SOLANA_DEPLOYER_KEYPAIR;
if (!keypairFile) throw new Error('Set SOLANA_DEPLOYER_KEYPAIR to a funded devnet keypair JSON file.');
if (!config.treasury || config.treasury.startsWith('REPLACE_')) throw new Error('Set a valid treasury public key in the drop config.');

const umi = createUmi(config.rpcUrl).use(mplCore()).use(mplCandyMachine());
const identity = await loadIdentity(umi, keypairFile);
umi.use(keypairIdentity(identity));

console.log(`Using ${identity.publicKey} on ${config.cluster}`);

let collectionAddress = process.env.CORE_COLLECTION_ADDRESS || '';
if (!collectionAddress) {
  const collection = generateSigner(umi);
  const plugins = config.royaltyBasisPoints > 0 ? [{
    type: 'Royalties',
    basisPoints: config.royaltyBasisPoints,
    creators: [{ address: identity.publicKey, percentage: 100 }],
    ruleSet: ruleSet('None'),
  }] : [];
  await createCollection(umi, {
    collection,
    name: config.collectionName,
    uri: config.collectionUri,
    plugins,
  }).sendAndConfirm(umi);
  collectionAddress = collection.publicKey.toString();
  console.log(`Core collection created: ${collectionAddress}`);
}

const guards = {
  startDate: some({ date: dateTime(config.mintStart) }),
  mintLimit: some({ id: config.mintLimitId, limit: config.mintLimitPerWallet }),
};
if (Number(config.mintPriceSol) > 0) {
  guards.solPayment = some({ lamports: sol(Number(config.mintPriceSol)), destination: publicKey(config.treasury) });
}

const candyMachine = generateSigner(umi);
await create(umi, {
  candyMachine,
  collection: publicKey(collectionAddress),
  collectionUpdateAuthority: umi.identity,
  itemsAvailable: config.itemsAvailable,
  isMutable: true,
  configLineSettings: some({
    prefixName: config.prefixName,
    nameLength: config.nameLength,
    prefixUri: config.prefixUri,
    uriLength: config.uriLength,
    isSequential: Boolean(config.isSequential),
  }),
  guards,
}).sendAndConfirm(umi);

await fs.mkdir('.generated', { recursive: true });
const state = {
  cluster: config.cluster,
  rpcUrl: config.rpcUrl,
  collection: collectionAddress,
  candyMachine: candyMachine.publicKey.toString(),
  createdAt: new Date().toISOString(),
  configPath,
  treasury: config.treasury,
  mintPriceSol: Number(config.mintPriceSol),
};
await fs.writeFile('.generated/drop-state.json', JSON.stringify(state, null, 2));
console.log(`Core Candy Machine created: ${state.candyMachine}`);
console.log('Saved .generated/drop-state.json. Load all 5,000 item config lines before opening the mint.');
