async function seedVehiclesIfNeeded() {
  return { seeded: false, count: 0 };
}

async function removeSeedVehicles() {
  return { removed: 0 };
}

module.exports = {
  seedVehiclesIfNeeded,
  removeSeedVehicles,
};
