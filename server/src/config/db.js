const mongoose = require("mongoose");

function normalizeMongoUri(rawUri) {
  if (!rawUri) {
    return "";
  }

  return String(rawUri).trim().replace(/^["']|["']$/g, "");
}

async function connectDB() {
  const primaryUri = normalizeMongoUri(process.env.MONGODB_URI || process.env.DB_CONNECT);
  const fallbackUri = normalizeMongoUri(process.env.MONGODB_FALLBACK_URI || "mongodb://127.0.0.1:27017/auto-flex");
  const uri = primaryUri || fallbackUri;

  if (!uri) {
    throw new Error("Missing MongoDB connection string. Set MONGODB_URI or DB_CONNECT.");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
    });
  } catch (error) {
    if (primaryUri && primaryUri.startsWith("mongodb+srv://")) {
      console.warn("Atlas SRV connection failed, retrying local MongoDB fallback...");
      await mongoose.connect(fallbackUri, {
        dbName: process.env.MONGODB_DB || "auto-flex",
      });
    } else {
      throw error;
    }
  }

  return mongoose.connection;
}

module.exports = { connectDB };
