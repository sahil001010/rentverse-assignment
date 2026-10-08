import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mainnetRpc: process.env.MAINNET_RPC_URL || "https://ethereum.publicnode.com",
  sepoliaRpc: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  polygonRpc: process.env.POLYGON_RPC_URL || "https://rpc.ankr.com/polygon",
  baseRpc: process.env.BASE_RPC_URL || "https://base-rpc.publicnode.com",
  propertySharesAddress: process.env.PROPERTY_SHARES_ADDRESS || "",
  propertySharesChainId: Number(process.env.PROPERTY_SHARES_CHAIN_ID || 11155111),
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required. Copy api/.env.example to api/.env.");
}
