require("dotenv").config();

const { connectDB } = require("../src/config/db");
const { removeSeedVehicles } = require("../src/data/seedVehicles");

async function main() {
  await connectDB();
  const result = await removeSeedVehicles();
  console.log(`Removed ${result.removed} demo vehicles from MongoDB.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to remove demo vehicles:");
  console.error(error);
  process.exit(1);
});
