import crypto from "crypto";

const TTL_MS = 5 * 60 * 1000;
const nonces = new Map();

function prune() {
  const now = Date.now();
  for (const [address, record] of nonces) {
    if (record.expiresAt <= now) nonces.delete(address);
  }
}

export function issueLoginChallenge(address, message) {
  prune();
  const nonce = crypto.randomBytes(16).toString("hex");
  const finalMessage = message.replace("{nonce}", nonce);
  nonces.set(address.toLowerCase(), {
    nonce,
    message: finalMessage,
    expiresAt: Date.now() + TTL_MS,
  });
  return { nonce, message: finalMessage, expiresInSeconds: TTL_MS / 1000 };
}

export function takeLoginChallenge(address) {
  prune();
  const record = nonces.get(address.toLowerCase());
  if (!record) return null;
  nonces.delete(address.toLowerCase());
  if (record.expiresAt <= Date.now()) return null;
  return record;
}
