import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

const databaseName = process.env.MONGODB_DATABASE || "c20441826_ead_assignment_db";

let cachedClient = globalThis.__mongoClient;
let cachedDb = globalThis.__mongoDb;
let cachedMemoryServer = globalThis.__mongoMemoryServer;

async function getMongoUri() {

  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  if (!cachedMemoryServer) {

    cachedMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: databaseName,
      },
    });

    globalThis.__mongoMemoryServer = cachedMemoryServer;

  }

  return cachedMemoryServer.getUri();

}

export async function getDb() {

  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const uri = await getMongoUri();
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  cachedDb = cachedClient.db(databaseName);
  globalThis.__mongoClient = cachedClient;
  globalThis.__mongoDb = cachedDb;

  return cachedDb;

}

export function getCollectionName() {

  return process.env.MONGODB_COLLECTION || "artworks";
  
}