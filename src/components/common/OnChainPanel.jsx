import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { getNativeBalance, readContract } from "../../lib/api";

export default function OnChainPanel() {
  const { isLoggedIn, account, chainId } = useWallet();
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !account) {
      setSnapshot(null);
      setError("");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      getNativeBalance(account, chainId || 1),
      readContract("usdc", "symbol"),
      readContract("usdc", "balanceOf", [account]),
      readContract("usdc", "decimals"),
    ])
      .then(([native, symbol, balance, decimals]) => {
        if (cancelled) return;
        const units = 10 ** Number(decimals.result);
        const formattedUsdc = (Number(balance.result) / units).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
        setSnapshot({
          native: `${Number(native.formatted).toFixed(4)} ${native.symbol}`,
          network: native.chainId,
          usdcSymbol: symbol.result,
          usdcBalance: formattedUsdc,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not read chain data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, account, chainId]);

  if (!isLoggedIn) return null;

  return (
    <section className="container">
      <div className="bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Signed in</h2>
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              The API read these balances after your wallet signature. USDC is read from Ethereum mainnet.
            </p>
          </div>
          <span className="font-mono text-sm text-primary-700 dark:text-primary-300 break-all">{account}</span>
        </div>

        {loading && <p className="text-sm text-secondary-500">Reading the chain...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {snapshot && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
              <div className="text-xs uppercase tracking-wide text-secondary-500">Wallet balance</div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-white">{snapshot.native}</div>
            </div>
            <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
              <div className="text-xs uppercase tracking-wide text-secondary-500">{snapshot.usdcSymbol} balance</div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-white">{snapshot.usdcBalance}</div>
            </div>
            <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 p-4">
              <div className="text-xs uppercase tracking-wide text-secondary-500">Balance chain id</div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-white">{snapshot.network}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
