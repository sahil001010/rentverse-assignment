import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { createLoginNonce, getSession, verifyLogin } from "../lib/api";

const WalletContext = createContext();
const SESSION_KEY = "rentverse_auth_session";

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function WalletProvider({ children }) {
  const { address, isConnected, chain, connector } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [session, setSession] = useState(readStoredSession);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const isLoggedIn = Boolean(
    session?.token && address && session.address?.toLowerCase() === address.toLowerCase()
  );

  useEffect(() => {
    localStorage.removeItem("rentverse_connected_account");
    localStorage.removeItem("rentverse_account_balance");
    localStorage.removeItem("rentverse_connection_type");
  }, []);

  useEffect(() => {
    if (!address || !session?.token) return undefined;
    if (session.address?.toLowerCase() !== address.toLowerCase()) {
      clearSession();
      return undefined;
    }

    let cancelled = false;
    getSession(session.token)
      .then((me) => {
        if (cancelled) return;
        if (me.address.toLowerCase() !== address.toLowerCase()) clearSession();
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, [address, session, clearSession]);

  const signIn = useCallback(async (nextAddress) => {
    const account = nextAddress || address;
    if (!account) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsSigningIn(true);
    try {
      const challenge = await createLoginNonce(account);
      const signature = await signMessageAsync({ message: challenge.message, account });
      const nextSession = await verifyLogin({ address: account, signature });
      const stored = { token: nextSession.token, address: nextSession.address };
      localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
      setSession(stored);
      showToast(`Logged in: ${account.slice(0, 6)}...${account.slice(-4)}`);
      setIsWalletModalOpen(false);
    } catch (error) {
      const message = error?.shortMessage || error?.message || "Could not sign in";
      if (/reject|denied|cancel/i.test(message)) {
        showToast("Signature cancelled. Connect the wallet, then sign in to enter the platform.");
      } else {
        showToast(message);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [address, signMessageAsync]);

  const connectWith = useCallback(async (connector) => {
    if (!connector) {
      showToast("That wallet connector is not available");
      return;
    }

    try {
      const result = await connectAsync({ connector });
      const connectedAccount = result.accounts?.[0];
      const nextAddress = typeof connectedAccount === "string" ? connectedAccount : connectedAccount?.address;
      await signIn(nextAddress);
    } catch (error) {
      const message = error?.shortMessage || error?.message || "Failed to connect wallet";
      if (/reject|denied|cancel/i.test(message)) {
        showToast("Connection cancelled");
      } else if (/provider not found|not installed|No provider/i.test(message)) {
        showToast("MetaMask is not installed in this browser");
      } else {
        showToast(message);
      }
    }
  }, [connectAsync, signIn]);

  const connectMetaMask = () => {
    const metaMask = connectors.find((item) => item.type === "injected" || item.id === "injected" || item.name === "MetaMask");
    return connectWith(metaMask);
  };

  const connectWalletConnect = () => {
    const walletConnect = connectors.find((item) => item.id === "walletConnect");
    if (!walletConnect) {
      showToast("Add REACT_APP_WALLETCONNECT_PROJECT_ID to enable WalletConnect");
      return;
    }
    return connectWith(walletConnect);
  };

  const disconnectWallet = () => {
    disconnect();
    clearSession();
    showToast("Logged out");
    closeWalletModal();
  };

  const connectionType = connector?.id === "walletConnect"
    ? "walletconnect"
    : connector
      ? "metamask"
      : null;

  return (
    <WalletContext.Provider
      value={{
        account: address || null,
        balance: balanceData?.formatted ? Number(balanceData.formatted).toFixed(4) : "0.00",
        balanceSymbol: balanceData?.symbol || "ETH",
        networkName: chain?.name || "Not connected",
        chainId: chain?.id || null,
        isConnected,
        isLoggedIn,
        isConnecting: isPending || isSigningIn,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        connectMetaMask,
        connectWalletConnect,
        signIn,
        disconnectWallet,
        connectionType,
        sessionToken: isLoggedIn ? session.token : null,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
