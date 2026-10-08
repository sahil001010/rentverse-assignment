import { createConfig, createStorage, http, injected } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { base, mainnet, polygon, sepolia } from "wagmi/chains";

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const connectors = [
  injected({
    target: "metaMask",
  }),
];

if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "RentVerse",
        description: "Sign in and invest in tokenized real estate",
        url: appUrl,
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    })
  );
}

export const walletConnectEnabled = Boolean(projectId);

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, polygon, base],
  connectors,
  transports: {
    [mainnet.id]: http("https://ethereum.publicnode.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [polygon.id]: http("https://rpc.ankr.com/polygon"),
    [base.id]: http("https://base-rpc.publicnode.com"),
  },
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  ssr: false,
});
