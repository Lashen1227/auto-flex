const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "AutoFlex Germany" },
    city: { type: String, trim: true, default: "Berlin" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true, min: 1886 },
    priceEUR: { type: Number, required: true, index: true, min: 0 },
    currency: { type: String, default: "EUR", trim: true },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
      index: true,
    },
    location: { type: String, required: true, index: true, trim: true },
    summary: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    rangeKm: { type: Number, min: 0, default: null },
    power: { type: String, trim: true, default: "" },
    drivetrain: { type: String, trim: true, default: "" },
    transmission: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "" },
    seats: { type: Number, min: 1, default: null },
    mileageKm: { type: Number, min: 0, default: null },
    bodyStyle: { type: String, trim: true, default: "" },
    condition: { type: String, trim: true, default: "new" },
    features: [{ type: String, trim: true }],
    createdBy: { type: String, index: true, trim: true },
    stockCount: { type: Number, default: 1, min: 0 },
    availability: { type: Boolean, default: true },
    dealer: { type: dealerSchema, default: () => ({}) },
    featured: { type: Boolean, default: false, index: true },
    freshArrival: { type: Boolean, default: true },
    stockNumber: { type: String, trim: true, default: "" },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vehicleSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.range = ret.rangeKm;
    ret.isNew = ret.freshArrival;
    return ret;
  },
});

vehicleSchema.index({ model: 1, year: -1 });
vehicleSchema.index({ category: 1, status: 1, priceEUR: 1 });
vehicleSchema.index({ location: 1, featured: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
