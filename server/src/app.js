const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const vehicleRoutes = require("./routes/vehicleRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

function isAllowedDevOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch (_error) {
    return false;
  }
}

function createApp() {
  const app = express();

  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const isProduction = process.env.NODE_ENV === "production";

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (origin === allowedOrigin) {
        return callback(null, true);
      }

      if (!isProduction && isAllowedDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-AutoFlex-Auth-Intent"],
  };

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "auto-flex-backend",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api", (_req, res) => {
    res.json({
      message: "AutoFlex API is running",
      routes: {
        health: "/health",
        vehicles: "/api/vehicles",
        users: "/api/users",
        summary: "/api/vehicles/summary",
        categories: "/api/vehicles/categories",
      },
    });
  });

  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/users", userRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
