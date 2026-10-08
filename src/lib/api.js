const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function request(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the RentVerse API. Start it with npm start.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload?.error?.message || "Request failed");
  }
  return payload.data;
}

export function createLoginNonce(address) {
  return request("/api/v1/auth/nonce", { method: "POST", body: { address } });
}

export function verifyLogin({ address, signature }) {
  return request("/api/v1/auth/verify", { method: "POST", body: { address, signature } });
}

export function getSession(token) {
  return request("/api/v1/auth/me", { token });
}

export function getNativeBalance(address, chainId) {
  const query = chainId ? `?chainId=${chainId}` : "";
  return request(`/api/v1/chains/balance/${address}${query}`);
}

export function readContract(contractId, functionName, args = []) {
  return request(`/api/v1/contracts/${contractId}/read`, {
    method: "POST",
    body: { functionName, args },
  });
}

export function encodeContract(contractId, functionName, args, token) {
  return request(`/api/v1/contracts/${contractId}/encode`, {
    method: "POST",
    body: { functionName, args },
    token,
  });
}
