const mongoose = require("mongoose");

function normalizeMongoUri(rawUri) {
  if (!rawUri) {
    return "";
  }

  return String(rawUri).trim().replace(/^["']|["']$/g, "");
}

async function connectDB() {
  const uri = normalizeMongoUri(process.env.MONGODB_URI || process.env.DB_CONNECT);

  if (!uri) {
    throw new Error("Missing MongoDB connection string. Set MONGODB_URI or DB_CONNECT.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
  });

  return mongoose.connection;
}

module.exports = { connectDB };
