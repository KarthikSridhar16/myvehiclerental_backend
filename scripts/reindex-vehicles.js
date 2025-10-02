import 'dotenv/config.js';
import mongoose from 'mongoose';
import Vehicle from '../src/models/Vehicle.js';
import { env } from '../src/config/env.js';

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected');

  // Drop any existing text index so the new definition (with `type`) can be created.
  const indexes = await Vehicle.collection.indexes();
  for (const idx of indexes) {
    const isText = Object.values(idx.key || {}).some(v => v === 'text');
    if (isText) {
      console.log('Dropping old text index:', idx.name);
      await Vehicle.collection.dropIndex(idx.name).catch(() => {});
    }
  }

  // Build indexes as per the schema
  await Vehicle.syncIndexes();
  console.log('Rebuilt indexes');
  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
