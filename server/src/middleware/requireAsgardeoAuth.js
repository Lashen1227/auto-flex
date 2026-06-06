const { readBearerToken, verifyAsgardeoIdToken } = require("../services/asgardeoToken");

async function requireAsgardeoAuth(req, res, next) {
  try {
    const token = readBearerToken(req);
    const payload = await verifyAsgardeoIdToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    error.status = error.status || 401;
    return next(error);
  }
}

module.exports = { requireAsgardeoAuth };
