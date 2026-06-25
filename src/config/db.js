const { MongoClient, ServerApiVersion } = require("mongodb");

let db = null;
let client = null;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  db = client.db("promptbay-db");

  console.log("MongoDB Connected");

  return db;
}

function getDB() {
  return db;
}

module.exports = {
  connectDB,
  getDB,
};