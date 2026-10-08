import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { walletConnectEnabled } from "../../config/wagmi";
import { FiX, FiCopy, FiCheck, FiLogOut } from "react-icons/fi";
import { SiEthereum, SiWalletconnect } from "react-icons/si";

export default function WalletModal() {
  const {
    account,
    balance,
    balanceSymbol,
    networkName,
    isConnected,
    isLoggedIn,
    isConnecting,
    isWalletModalOpen,
    closeWalletModal,
    connectMetaMask,
    connectWalletConnect,
    signIn,
    disconnectWallet,
    connectionType,
  } = useWallet();

  const [copied, setCopied] = useState(false);

  if (!isWalletModalOpen) return null;

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAccount = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  const walletLabel = connectionType === "walletconnect" ? "WalletConnect" : "MetaMask";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-md bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl overflow-hidden border border-secondary-200 dark:border-secondary-700 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100 dark:border-secondary-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <SiWalletconnect className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
              {isLoggedIn ? "Signed in" : "Sign in with wallet"}
            </h3>
          </div>
          <button
            onClick={closeWalletModal}
            className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!isConnected ? (
            <>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Choose a wallet. MetaMask will ask you to sign a login message. That signature does not send a transaction.
              </p>

              <div className="space-y-3">
                <button
                  onClick={connectMetaMask}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 bg-secondary-50 dark:bg-secondary-700/50 hover:bg-primary-50/50 dark:hover:bg-secondary-700 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-500">
                      <SiEthereum className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        MetaMask
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        Browser extension
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300">
                    Recommended
                  </span>
                </button>

                <button
                  onClick={connectWalletConnect}
                  disabled={isConnecting || !walletConnectEnabled}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 bg-secondary-50 dark:bg-secondary-700/50 hover:bg-primary-50/50 dark:hover:bg-secondary-700 transition-all group disabled:opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center text-sky-600">
                      <SiWalletconnect className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        WalletConnect
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        {walletConnectEnabled
                          ? "Mobile wallets and WalletConnect QR"
                          : "Set REACT_APP_WALLETCONNECT_PROJECT_ID to enable"}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {isConnecting && (
                <div className="text-center py-2 text-sm text-primary-600 dark:text-primary-400 animate-pulse">
                  Waiting for the wallet...
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-secondary-50 dark:bg-secondary-900/60 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                    {isLoggedIn ? `Signed in via ${walletLabel}` : `Connected via ${walletLabel}`}
                  </span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
                    {networkName}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">Account Address</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-secondary-900 dark:text-white">
                      {truncatedAccount}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-secondary-200/60 dark:border-secondary-700/60 flex items-center justify-between">
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">Balance</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                    {balance} {balanceSymbol}
                  </span>
                </div>
              </div>

              {!isLoggedIn && (
                <button
                  onClick={() => signIn()}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700"
                >
                  {isConnecting ? "Waiting for signature..." : "Sign in to RentVerse"}
                </button>
              )}

              <button
                onClick={disconnectWallet}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
