const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMaybeNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

function parseMaybeBoolean(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  return Boolean(value);
}

function assertValidObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid vehicle id");
    error.status = 400;
    throw error;
  }
}

function buildVehiclePayload(body, { isPartial = false } = {}) {
  const payload = {};
  const fields = [
    "slug",
    "category",
    "make",
    "model",
    "location",
    "summary",
    "description",
    "power",
    "drivetrain",
    "transmission",
    "color",
    "bodyStyle",
    "condition",
    "currency",
    "stockNumber",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  const numericFields = ["year", "priceEUR", "rangeKm", "seats", "mileageKm"];
  for (const field of numericFields) {
    const parsed = parseMaybeNumber(body[field]);
    if (parsed !== undefined) {
      payload[field] = parsed;
    }
  }

  if (body.status !== undefined) {
    payload.status = body.status;
  }

  if (body.featured !== undefined) {
    payload.featured = parseMaybeBoolean(body.featured);
  }

  if (body.isNew !== undefined) {
    payload.isNew = parseMaybeBoolean(body.isNew);
  }

  if (body.features !== undefined) {
    payload.features = Array.isArray(body.features)
      ? body.features
      : String(body.features)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
  }

  if (body.images !== undefined) {
    payload.images = Array.isArray(body.images) ? body.images : [];
  }

  if (body.dealer !== undefined) {
    payload.dealer = body.dealer;
  }

  if (body.specs !== undefined) {
    payload.specs = body.specs;
  }

  if (body.customFields !== undefined) {
    payload.customFields = body.customFields;
  }

  if (!isPartial) {
    const required = ["category", "make", "model", "year", "priceEUR", "location"];
    const missing = required.filter((field) => payload[field] === undefined || payload[field] === "");

    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(", ")}`);
      error.status = 400;
      throw error;
    }

    if (!payload.slug) {
      payload.slug = slugify([payload.category, payload.make, payload.model, payload.year].join(" "));
    }
  }

  return payload;
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Vehicle.findOne(query).select("_id").lean();
    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function listVehicles(req, res) {
  const {
    category,
    status,
    make,
    location,
    search,
    featured,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sort = "-createdAt",
  } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (make) filter.make = new RegExp(make, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (featured !== undefined) filter.featured = parseMaybeBoolean(featured);

  if (minPrice || maxPrice) {
    filter.priceEUR = {};
    if (minPrice) filter.priceEUR.$gte = Number(minPrice);
    if (maxPrice) filter.priceEUR.$lte = Number(maxPrice);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { make: regex },
      { model: regex },
      { category: regex },
      { location: regex },
      { summary: regex },
      { description: regex },
    ];
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (pageNumber - 1) * pageSize;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter).sort(sort).skip(skip).limit(pageSize),
    Vehicle.countDocuments(filter),
  ]);

  res.json({
    data: vehicles.map((vehicle) => vehicle.toJSON()),
    meta: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize) || 1,
    },
  });
}

async function getVehicleById(req, res) {
  assertValidObjectId(req.params.id);
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  return res.json({ data: vehicle.toJSON() });
}

async function createVehicle(req, res) {
  const payload = buildVehiclePayload(req.body);
  payload.slug = payload.slug || slugify([payload.category, payload.make, payload.model, payload.year].join(" "));
  payload.slug = await ensureUniqueSlug(payload.slug);

  const vehicle = await Vehicle.create(payload);
  return res.status(201).json({ data: vehicle.toJSON() });
}

async function updateVehicle(req, res) {
  assertValidObjectId(req.params.id);
  const payload = buildVehiclePayload(req.body, { isPartial: true });
  const current = await Vehicle.findById(req.params.id);

  if (!current) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  if (payload.slug) {
    payload.slug = await ensureUniqueSlug(payload.slug, current._id);
  }

  Object.assign(current, payload);
  await current.save();

  return res.json({ data: current.toJSON() });
}

async function deleteVehicle(req, res) {
  assertValidObjectId(req.params.id);
  const deleted = await Vehicle.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  return res.status(204).send();
}

async function getVehicleSummary(req, res) {
  const [byCategory, byStatus, totals] = await Promise.all([
    Vehicle.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, minPrice: { $min: "$priceEUR" }, maxPrice: { $max: "$priceEUR" } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Vehicle.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Vehicle.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          averagePrice: { $avg: "$priceEUR" },
          minPrice: { $min: "$priceEUR" },
          maxPrice: { $max: "$priceEUR" },
        },
      },
    ]),
  ]);

  res.json({
    data: {
      byCategory,
      byStatus,
      totals: totals[0] || { count: 0, averagePrice: 0, minPrice: 0, maxPrice: 0 },
    },
  });
}

async function listCategories(req, res) {
  const categories = await Vehicle.distinct("category");
  res.json({ data: categories.sort() });
}

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleSummary,
  listCategories,
};
