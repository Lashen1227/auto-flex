const User = require("../models/User");
const { readBearerToken, verifyAsgardeoIdToken } = require("../services/asgardeoToken");

function normalizeClaimValue(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  return value ?? "";
}

async function syncAuthenticatedUser(req, res) {
  const token = readBearerToken(req);
  const payload = await verifyAsgardeoIdToken(token);

  const sub = String(payload.sub || "").trim();

  if (!sub) {
    const error = new Error("ID token did not contain a sub claim");
    error.status = 400;
    throw error;
  }

  const now = new Date();
  const email = normalizeClaimValue(payload.email);
  const username = normalizeClaimValue(payload.preferred_username || payload.username);
  const displayName = normalizeClaimValue(
    payload.displayName || payload.name || payload.preferred_username || payload.username || payload.email || payload.sub,
  );

  const update = {
    sub,
    email,
    username,
    displayName,
    tenantDomain: normalizeClaimValue(payload.tenant_domain),
    picture: normalizeClaimValue(payload.picture),
    provider: "asgardeo",
    authSource:
      String(req.headers["x-autoflex-auth-intent"] || "").toLowerCase() === "self-registration"
        ? "self-registration"
        : "asgardeo",
    emailVerified:
      payload["urn:scim:wso2:schema"]?.emailVerified === "true"
        ? true
        : payload["urn:scim:wso2:schema"]?.emailVerified === "false"
          ? false
          : null,
    lastSignedInAt: now,
    rawClaims: payload,
  };

  const user = await User.findOneAndUpdate(
    { sub },
    {
      $setOnInsert: { firstSeenAt: now },
      $set: update,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    data: user.toJSON(),
  });
}

async function getMyUser(req, res) {
  const token = readBearerToken(req);
  const payload = await verifyAsgardeoIdToken(token);
  const user = await User.findOne({ sub: String(payload.sub || "").trim() });

  if (!user) {
    return res.status(404).json({ message: "User not synced yet" });
  }

  return res.json({ data: user.toJSON() });
}

module.exports = {
  syncAuthenticatedUser,
  getMyUser,
};
