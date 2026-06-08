import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleConnect = () => {
    // Find injected (MetaMask) connector
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      alert("MetaMask not detected. Please install the MetaMask extension!");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {chain && chain.id !== 31337 && chain.id !== 80002 && (
          <span className="text-xs font-semibold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
            ⚠️ Switch to Polygon Amoy or Localhost
          </span>
        )}
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full backdrop-blur-md shadow-lg shadow-black/30">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200 font-mono text-sm">{formatAddress(address)}</span>
          <button
            onClick={() => disconnect()}
            className="ml-2 text-xs text-zinc-400 hover:text-rose-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="relative overflow-hidden group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-full shadow-lg shadow-emerald-950/20 active:scale-95 transition-all duration-200"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
        alt="MetaMask Logo"
        className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
      />
      Connect MetaMask
    </button>
  );
}
