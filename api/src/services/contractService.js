import { encodeFunctionData, isAddress } from "viem";
import { HttpError } from "../errors/HttpError.js";
import { getPublicClient } from "./chainService.js";
import { serialize } from "./serialize.js";

const MAX_LOG_RANGE = 2000n;

function findFunction(abi, functionName) {
  const item = abi.find((entry) => entry.type === "function" && entry.name === functionName);
  if (!item) {
    throw new HttpError(400, "UNKNOWN_FUNCTION", `Function "${functionName}" is not in this contract ABI`);
  }
  return item;
}

function assertArgs(item, args) {
  const expected = item.inputs?.length || 0;
  const received = Array.isArray(args) ? args.length : 0;
  if (expected !== received) {
    throw new HttpError(400, "INVALID_ARGS", `${item.name} expects ${expected} argument(s)`);
  }
  return Array.isArray(args) ? args : [];
}

export async function readContractCall(contract, { functionName, args = [] }) {
  const item = findFunction(contract.abi, functionName);
  if (item.stateMutability !== "view" && item.stateMutability !== "pure") {
    throw new HttpError(400, "NOT_A_READ", `${functionName} changes state. Use the encode endpoint and sign it in the wallet.`);
  }

  const client = getPublicClient(contract.chainId);
  try {
    const result = await client.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName,
      args: assertArgs(item, args),
    });
    return serialize({ functionName, result });
  } catch (error) {
    throw new HttpError(502, "RPC_READ_FAILED", error.shortMessage || "The chain rejected this read");
  }
}

export async function encodeContractCall(contract, { functionName, args = [] }) {
  const item = findFunction(contract.abi, functionName);
  if (item.stateMutability === "view" || item.stateMutability === "pure") {
    throw new HttpError(400, "NOT_A_WRITE", `${functionName} is a read. Use the read endpoint.`);
  }

  const normalizedArgs = assertArgs(item, args);
  let value = "0";

  if (contract.configured && functionName === "invest") {
    const price = await readContractCall(contract, { functionName: "sharePriceWei", args: [] });
    const shares = BigInt(normalizedArgs[0]);
    value = (BigInt(price.result) * shares).toString();
  }

  const data = encodeFunctionData({
    abi: contract.abi,
    functionName,
    args: normalizedArgs,
  });

  return {
    contractId: contract.id,
    functionName,
    chainId: contract.chainId,
    to: contract.address,
    data,
    value,
    readyToSend: Boolean(contract.address),
  };
}

export async function readContractEvents(contract, { eventName, fromBlock, toBlock }) {
  const event = contract.abi.find((entry) => entry.type === "event" && entry.name === eventName);
  if (!event) {
    throw new HttpError(400, "UNKNOWN_EVENT", `Event "${eventName}" is not in this contract ABI`);
  }
  if (fromBlock === undefined || fromBlock === null || fromBlock === "") {
    throw new HttpError(400, "FROM_BLOCK_REQUIRED", "fromBlock is required so log scans stay bounded");
  }

  const client = getPublicClient(contract.chainId);
  const start = BigInt(fromBlock);
  const end = toBlock === undefined || toBlock === "latest" ? await client.getBlockNumber() : BigInt(toBlock);
  if (end < start || end - start > MAX_LOG_RANGE) {
    throw new HttpError(400, "RANGE_TOO_LARGE", `Event scans are limited to ${MAX_LOG_RANGE} blocks`);
  }

  try {
    const logs = await client.getContractEvents({
      address: contract.address,
      abi: contract.abi,
      eventName,
      fromBlock: start,
      toBlock: end,
    });
    return serialize({
      eventName,
      fromBlock: start,
      toBlock: end,
      logs: logs.slice(0, 100).map((log) => ({
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        args: log.args,
      })),
    });
  } catch (error) {
    throw new HttpError(502, "RPC_LOG_FAILED", error.shortMessage || "The chain rejected this log query");
  }
}

export function assertAddress(address) {
  if (!isAddress(address)) {
    throw new HttpError(400, "INVALID_ADDRESS", "A valid Ethereum address is required");
  }
}
