const Vehicle = require("../models/Vehicle");

const seedVehicles = [
  {
    slug: "tesla-model-y-long-range-2025",
    category: "electric-car",
    model: "Model Y Long Range",
    year: 2025,
    priceEUR: 49990,
    status: "available",
    location: "Berlin",
    summary: "A practical all-electric SUV with long range and minimal running costs.",
    description:
      "Built for German urban and intercity driving, this Model Y combines a roomy interior with fast charging and strong range for family-friendly mobility.",
    rangeKm: 533,
    power: "378 kW",
    drivetrain: "AWD",
    transmission: "Automatic",
    color: "Pearl White Multi-Coat",
    seats: 5,
    bodyStyle: "SUV",
    condition: "new",
    features: ["Fast charging", "Heat pump", "Autopilot-ready hardware", "Panoramic glass roof"],
    dealer: { name: "AutoFlex Germany", city: "Berlin", phone: "+49 30 555 0123", email: "sales@autoflex.de" },
    featured: true,
    freshArrival: true,
    stockNumber: "EV-1001",
    specs: {
      batteryCapacityKWh: 75,
      chargingSpeedKw: 250,
      infotainment: "15-inch touchscreen",
    },
  },
  {
    slug: "volkswagen-id-3-pro-2024",
    category: "electric-car",
    model: "ID.3 Pro",
    year: 2024,
    priceEUR: 36950,
    status: "reserved",
    location: "Munich",
    summary: "Compact electric hatchback built for city life and everyday commuting.",
    description:
      "A versatile and efficient EV for drivers who want a smaller footprint, smart connectivity, and strong efficiency in German cities.",
    rangeKm: 426,
    power: "150 kW",
    drivetrain: "RWD",
    transmission: "Automatic",
    color: "Moonstone Grey",
    seats: 5,
    bodyStyle: "Hatchback",
    condition: "used",
    mileageKm: 8200,
    features: ["Adaptive cruise control", "Wireless CarPlay", "Parking sensors", "LED matrix lights"],
    dealer: { name: "AutoFlex Germany", city: "Munich", phone: "+49 89 555 0211", email: "munich@autoflex.de" },
    featured: false,
    freshArrival: false,
    stockNumber: "EV-1024",
    specs: {
      batteryCapacityKWh: 58,
      chargingSpeedKw: 120,
      interiorTrim: "Style Package",
    },
  },
  {
    slug: "urban-cargo-longtail-2025",
    category: "cargo-bike",
    model: "Cargo Longtail",
    year: 2025,
    priceEUR: 5290,
    status: "available",
    location: "Hamburg",
    summary: "A flexible cargo bike for family logistics, deliveries, and last-mile transport.",
    description:
      "Designed for growing urban transport needs, this longtail cargo bike is ready for groceries, school runs, and business deliveries across Germany.",
    rangeKm: 110,
    power: "250 W",
    drivetrain: "Belt drive",
    transmission: "Automatic",
    color: "Deep Ocean Blue",
    seats: 2,
    bodyStyle: "Cargo bike",
    condition: "new",
    features: ["Front cargo rack", "Integrated lights", "Rain cover ready", "Puncture-resistant tyres"],
    dealer: { name: "AutoFlex Germany", city: "Hamburg", phone: "+49 40 555 0137", email: "hamburg@autoflex.de" },
    featured: true,
    freshArrival: true,
    stockNumber: "CB-2001",
    specs: {
      payloadKg: 180,
      batteryCapacityWh: 625,
      assistLevels: 5,
    },
  },
  {
    slug: "reiserad-cargo-pro-2024",
    category: "cargo-bike",
    model: "Cargo Pro",
    year: 2024,
    priceEUR: 4490,
    status: "sold",
    location: "Cologne",
    summary: "Compact cargo bike with a balanced frame and strong carrying capacity.",
    description:
      "A dependable city cargo bike for riders who want a smaller footprint without giving up carrying flexibility or battery-assisted range.",
    rangeKm: 95,
    power: "250 W",
    drivetrain: "Chain drive",
    transmission: "Automatic",
    color: "Graphite Black",
    seats: 1,
    bodyStyle: "Cargo bike",
    condition: "used",
    mileageKm: 420,
    features: ["Lockable battery", "Suspension fork", "Extended mudguards", "Rear basket mount"],
    dealer: { name: "AutoFlex Germany", city: "Cologne", phone: "+49 221 555 0199", email: "cologne@autoflex.de" },
    featured: false,
    freshArrival: false,
    stockNumber: "CB-2010",
    specs: {
      payloadKg: 150,
      batteryCapacityWh: 500,
      assistLevels: 4,
    },
  },
];

async function seedVehiclesIfNeeded() {
  const count = await Vehicle.countDocuments();

  if (count > 0) {
    return { seeded: false, count };
  }

  await Vehicle.insertMany(seedVehicles, { ordered: true });
  return { seeded: true, count: seedVehicles.length };
}

async function removeSeedVehicles() {
  const slugs = seedVehicles.map((vehicle) => vehicle.slug);
  const result = await Vehicle.deleteMany({ slug: { $in: slugs } });

  return {
    removed: result.deletedCount || 0,
  };
}

module.exports = {
  seedVehicles,
  seedVehiclesIfNeeded,
  removeSeedVehicles,
};
