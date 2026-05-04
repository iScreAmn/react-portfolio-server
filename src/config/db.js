import { MongoClient } from 'mongodb';
import { ensureIndexes as ensureAnalyticsIndexes } from '../analytics/repositories/analyticsRepository.js';
import { seedInitialAdminUser } from '../admin/services/adminBootstrap.js';

const getMongoUri = () => String(process.env.MONGODB_URI || '').trim();

const dbNameFromEnv = String(process.env.MONGODB_DB_NAME || '').trim();
let client;
let db;
let connectPromise;

const resolveDbName = (mongoUri) => {
  if (dbNameFromEnv) return dbNameFromEnv;
  const parsedUri = new URL(mongoUri);
  const dbNameFromUri = parsedUri.pathname.replace('/', '').trim();
  return dbNameFromUri || 'portfolio';
};

export const connectDB = async () => {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }
  if (db) return db;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    if (!client) {
      client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });
    }
    await client.connect();
    const dbName = resolveDbName(mongoUri);
    db = client.db(dbName);
    await ensureAnalyticsIndexes();
    await seedInitialAdminUser(db);
    return db;
  })();

  return connectPromise;
};

export const getDB = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};
