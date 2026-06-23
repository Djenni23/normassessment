import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "normassessment";

if (!uri) throw new Error("MONGODB_URI not set");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> =
  global._mongoClient ?? (global._mongoClient = new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export { clientPromise };
