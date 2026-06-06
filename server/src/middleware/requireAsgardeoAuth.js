const { readBearerToken, verifyAsgardeoIdToken } = require("../services/asgardeoToken");

async function requireAsgardeoAuth(req, res, next) {
  try {
    const token = readBearerToken(req);
    const payload = await verifyAsgardeoIdToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error?.message || error);
    const err = error instanceof Error ? error : new Error(String(error));
    err.status = err.status || 401;
    return next(err);
  }
}

module.exports = { requireAsgardeoAuth };
