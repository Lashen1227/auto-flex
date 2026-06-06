require("dotenv").config();

const { connectDB } = require("./src/config/db");
const { createApp } = require("./src/app");

process.on("uncaughtException", (error) => {
  console.error("[FATAL] Uncaught exception — keeping process alive:");
  console.error(error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection — keeping process alive:");
  console.error(reason);
});

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`AutoFlex API listening on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start AutoFlex backend:");
  console.error(error);
  process.exit(1);
});
