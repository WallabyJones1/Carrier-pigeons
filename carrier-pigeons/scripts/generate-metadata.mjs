import fs from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve(process.argv[2] ?? './assets/metadata');
const imageBase = (process.argv[3] ?? 'https://example.com/carrier-pigeons/images').replace(/\/$/, '');
const count = Math.max(1, Number(process.argv[4] ?? 5000));
await fs.mkdir(outputDir, { recursive: true });

for (let i = 1; i <= count; i += 1) {
  const id = String(i).padStart(4, '0');
  const metadata = {
    name: `Carrier Pigeon #${id}`,
    description: 'Carrier Pigeons — a gamified courier-racing NFT collection on Solana.',
    image: `${imageBase}/${id}.png`,
    external_url: 'https://example.com',
    attributes: [
      { trait_type: 'Generation', value: 'Genesis' },
      { trait_type: 'Race Status', value: 'Unregistered' }
    ],
    properties: { category: 'image', files: [{ uri: `${imageBase}/${id}.png`, type: 'image/png' }] }
  };
  await fs.writeFile(path.join(outputDir, `${id}.json`), JSON.stringify(metadata, null, 2));
}
console.log(`Generated ${count} metadata files in ${outputDir}`);
