import { createPublicClient, http } from "viem";
import { base, mainnet, polygon, sepolia } from "viem/chains";
import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";

const chainTable = [
  { chain: mainnet, rpcUrl: env.mainnetRpc },
  { chain: sepolia, rpcUrl: env.sepoliaRpc },
  { chain: polygon, rpcUrl: env.polygonRpc },
  { chain: base, rpcUrl: env.baseRpc },
];

const clients = new Map();

export function listChains() {
  return chainTable.map(({ chain }) => ({
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
  }));
}

export function getPublicClient(chainId) {
  const entry = chainTable.find((item) => item.chain.id === Number(chainId));
  if (!entry) {
    throw new HttpError(400, "UNSUPPORTED_CHAIN", `Chain ${chainId} is not configured`);
  }

  if (!clients.has(entry.chain.id)) {
    clients.set(
      entry.chain.id,
      createPublicClient({
        chain: entry.chain,
        transport: http(entry.rpcUrl),
      })
    );
  }

  return clients.get(entry.chain.id);
}
