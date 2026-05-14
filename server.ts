// import { Hono } from 'hono';
// import { imageEmbedding, textEmbedding } from './embed.ts';
// import weaviate from 'weaviate-client';
// import fs from 'fs';
// import path from 'path';

// const app = new Hono();

// const client = weaviate.client({
//   config: {
//     scheme: 'http',
//     host: 'localhost:8080',
//   },
// });

// // Ensure uploads folder exists
// const UPLOAD_DIR = './uploads';
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// // --- Upload Image ---
// app.post('/upload', async (c) => {
//   const form = await c.req.formData();
//   const file = form.get('image') as File;
//   const title = form.get('title')?.toString() ?? 'Untitled';

//   const filePath = path.join(UPLOAD_DIR, file.name);
//   const arrayBuffer = await file.arrayBuffer();
//   await Bun.write(filePath, new Uint8Array(arrayBuffer));

//   const vector = await imageEmbedding(filePath);

//   await client.data.creator()
//     .withClassName('Image')
//     .withProperties({ title, imageUrl: filePath })
//     .withVector(vector)
//     .do();

//   return c.json({ success: true });
// });

// // --- Search by Image ---
// app.post('/search-image', async (c) => {
//   const form = await c.req.formData();
//   const file = form.get('image') as File;

//   const filePath = path.join(UPLOAD_DIR, file.name);
//   const arrayBuffer = await file.arrayBuffer();
//   await Bun.write(filePath, new Uint8Array(arrayBuffer));

//   const vector = await imageEmbedding(filePath);

//   const result = await client.graphql.get()
//     .withClassName('Image')
//     .withFields('title imageUrl _additional { distance }')
//     .withNearVector({ vector, certainty: 0.7 })
//     .withLimit(5)
//     .do();

//   return c.json(result);
// });

// // --- Search by Text ---
// app.get('/search-text', async (c) => {
//   const q = c.req.query('q') || '';
//   const vector = await textEmbedding(q);

//   const result = await client.graphql.get()
//     .withClassName('Image')
//     .withFields('title imageUrl _additional { distance }')
//     .withNearVector({ vector, certainty: 0.7 })
//     .withLimit(5)
//     .do();

//   return c.json(result);
// });

// app.fire(); // starts server