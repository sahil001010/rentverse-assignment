import { isAddress } from "viem";
import { erc20Abi } from "../abi/erc20.js";
import { propertySharesAbi } from "../abi/propertyShares.js";
import { HttpError } from "../errors/HttpError.js";
import { env } from "./env.js";

const USDC_MAINNET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

function propertySharesAddress() {
  if (!env.propertySharesAddress) return null;
  if (!isAddress(env.propertySharesAddress)) {
    throw new HttpError(500, "INVALID_CONTRACT_CONFIG", "PROPERTY_SHARES_ADDRESS is not a valid address");
  }
  return env.propertySharesAddress;
}

export function listContracts() {
  return [
    {
      id: "property-shares",
      name: "RentVerse Property Shares",
      standard: "property-shares",
      chainId: env.propertySharesChainId,
      address: propertySharesAddress(),
      configured: Boolean(env.propertySharesAddress),
      abi: propertySharesAbi,
    },
    {
      id: "usdc",
      name: "USD Coin",
      standard: "erc20",
      chainId: 1,
      address: USDC_MAINNET,
      configured: true,
      abi: erc20Abi,
    },
  ];
}

export function getContract(id) {
  const contract = listContracts().find((item) => item.id === id);
  if (!contract) {
    throw new HttpError(404, "CONTRACT_NOT_FOUND", `No contract is registered with id "${id}"`);
  }
  return contract;
}

export function requireConfigured(contract) {
  if (!contract.configured || !contract.address) {
    throw new HttpError(
      409,
      "CONTRACT_NOT_CONFIGURED",
      "This contract does not have a deployed address yet. Deploy contracts/PropertyShares.sol and set PROPERTY_SHARES_ADDRESS."
    );
  }
  return contract;
}
