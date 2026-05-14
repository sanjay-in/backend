import { pipeline } from '@xenova/transformers';

const clip = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');

export async function imageEmbedding(path: string) {
  const output = await clip(path, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function textEmbedding(text: string) {
  const output = await clip(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}