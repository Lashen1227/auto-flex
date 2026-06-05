let joseModulePromise;

async function getJose() {
  if (!joseModulePromise) {
    joseModulePromise = import("jose");
  }

  return joseModulePromise;
}

function getAsgardeoBaseUrl() {
  const baseUrl = process.env.ASGARDEO_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing ASGARDEO_BASE_URL in server environment.");
  }

  return baseUrl.replace(/\/$/, "");
}

function getExpectedIssuer() {
  return `${getAsgardeoBaseUrl()}/oauth2/token`;
}

function getExpectedAudience() {
  const clientId = process.env.ASGARDEO_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing ASGARDEO_CLIENT_ID in server environment.");
  }

  return clientId;
}

async function verifyAsgardeoIdToken(idToken) {
  const { createRemoteJWKSet, jwtVerify } = await getJose();
  const issuer = getExpectedIssuer();
  const audience = getExpectedAudience();
  const jwksUrl = new URL(`${getAsgardeoBaseUrl()}/oauth2/jwks`);
  const jwks = createRemoteJWKSet(jwksUrl);

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience,
  });

  return payload;
}

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    const error = new Error("Missing bearer token");
    error.status = 401;
    throw error;
  }

  return token;
}

module.exports = {
  verifyAsgardeoIdToken,
  readBearerToken,
};
