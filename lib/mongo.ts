import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "normassessment";

if (!uri) throw new Error("MONGODB_URI not set");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

// Create the indexes the app relies on. Runs once per client connection.
// Wrapped so an index error (e.g. a pre-existing duplicate) never blocks startup.
async function ensureIndexes(client: MongoClient): Promise<void> {
  const db = client.db(dbName);
  try {
    await Promise.all([
      db.collection("assessments").createIndex({ ref: 1 }, { unique: true, name: "ref_unique" }),
      db.collection("assessments").createIndex({ createdAt: -1 }, { name: "createdAt_desc" }),
      db.collection("assessments").createIndex({ status: 1, createdAt: -1 }, { name: "status_createdAt" }),
      db.collection("assessments").createIndex({ "contact.name": 1 }, { name: "contact_name" }),
      db.collection("assessments").createIndex({ "location.country": 1 }, { name: "location_country" }),
      db.collection("users").createIndex({ email: 1 }, { unique: true, name: "email_unique" }),
    ]);
  } catch (err) {
    console.error("[mongo] ensureIndexes failed (continuing)", err);
  }
}

const clientPromise: Promise<MongoClient> =
  global._mongoClient ??
  (global._mongoClient = new MongoClient(uri).connect().then(async (client) => {
    await ensureIndexes(client);
    return client;
  }));

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export { clientPromise };
