const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    sub: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, trim: true, index: true, default: "" },
    username: { type: String, trim: true, default: "" },
    displayName: { type: String, trim: true, default: "" },
    tenantDomain: { type: String, trim: true, default: "" },
    picture: { type: String, trim: true, default: "" },
    provider: { type: String, trim: true, default: "asgardeo" },
    authSource: { type: String, trim: true, default: "self-registration" },
    emailVerified: { type: Boolean, default: null },
    firstSeenAt: { type: Date, default: Date.now },
    lastSignedInAt: { type: Date, default: Date.now },
    rawClaims: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
