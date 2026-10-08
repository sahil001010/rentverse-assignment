import jwt from "jsonwebtoken";
import { getAddress, isAddress, verifyMessage } from "viem";
import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import { issueLoginChallenge, takeLoginChallenge } from "./nonceStore.js";

function normalizeAddress(address) {
  if (!address || !isAddress(address)) {
    throw new HttpError(400, "INVALID_ADDRESS", "A valid Ethereum address is required");
  }
  return getAddress(address);
}

export function createLoginChallenge(address) {
  const checksum = normalizeAddress(address);
  const issuedAt = new Date().toISOString();
  const template = [
    "RentVerse wants you to sign in with your Ethereum account:",
    checksum,
    "",
    "Sign in to RentVerse. This request will not trigger a blockchain transaction or cost any gas.",
    "",
    `URI: ${env.clientOrigins[0]}`,
    "Nonce: {nonce}",
    `Issued At: ${issuedAt}`,
  ].join("\n");

  const challenge = issueLoginChallenge(checksum, template);
  return {
    address: checksum,
    nonce: challenge.nonce,
    message: challenge.message,
    expiresInSeconds: challenge.expiresInSeconds,
  };
}

export async function verifyLogin({ address, signature }) {
  const checksum = normalizeAddress(address);
  if (!signature || typeof signature !== "string" || !signature.startsWith("0x")) {
    throw new HttpError(400, "INVALID_SIGNATURE", "A hex signature is required");
  }

  const challenge = takeLoginChallenge(checksum);
  if (!challenge) {
    throw new HttpError(401, "CHALLENGE_EXPIRED", "Login challenge expired. Request a new one.");
  }

  let valid = false;
  try {
    valid = await verifyMessage({
      address: checksum,
      message: challenge.message,
      signature,
    });
  } catch {
    valid = false;
  }

  if (!valid) {
    throw new HttpError(401, "INVALID_SIGNATURE", "The wallet signature does not match this address");
  }

  const token = jwt.sign({ sub: checksum }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return {
    token,
    address: checksum,
    expiresIn: env.jwtExpiresIn,
  };
}

export function readSession(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload?.sub || !isAddress(payload.sub)) {
      throw new Error("Invalid token subject");
    }
    return { address: getAddress(payload.sub) };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "UNAUTHORIZED", "Sign in with your wallet to continue");
  }
}
