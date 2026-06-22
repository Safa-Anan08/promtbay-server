const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(
  process.env.MONGODB_URI,
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

let db;

const connectDB = async () => {
  try {
    await client.connect();

    db = client.db("promptbay-db");

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

const getDB = () => db;

module.exports = {
  connectDB,
  getDB,
  client,
};