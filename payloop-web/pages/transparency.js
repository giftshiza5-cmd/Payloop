import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { CircleVaultArtifact } from "../lib/contracts";

export default function Transparency() {
  const publicClient = usePublicClient();
  const [mounted, setMounted] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [circleData, setCircleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    // Auto-load if address is in query or localstorage or environment variables
    const saved = localStorage.getItem("payloop_vault") || process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS;
    if (saved) {
      setSearchAddress(saved);
      fetchCircleDetails(saved);
    }
  }, []);

  const fetchCircleDetails = async (addressToSearch) => {
    if (!addressToSearch) return;
    setIsLoading(true);
    setError("");
    setCircleData(null);
    try {
      // Fetch details using public client
      const name = await publicClient.readContract({
        address: addressToSearch,
        abi: CircleVaultArtifact.abi,
        functionName: "name",
      });

      const contributionAmount = await publicClient.readContract({
        address: addressToSearch,
        abi: CircleVaultArtifact.abi,
        functionName: "contributionAmount",
      });

      const currentCycleId = await publicClient.readContract({
        address: addressToSearch,
        abi: CircleVaultArtifact.abi,
        functionName: "currentCycleId",
      });

      const nextDeadline = await publicClient.readContract({
        address: addressToSearch,
        abi: CircleVaultArtifact.abi,
        functionName: "nextDeadline",
      });

      const members = await publicClient.readContract({
        address: addressToSearch,
        abi: CircleVaultArtifact.abi,
        functionName: "getMembers",
      });

      const balance = await publicClient.getBalance({ address: addressToSearch });

      setCircleData({
        address: addressToSearch,
        name,
        contributionAmount: formatEther(contributionAmount),
        currentCycleId: currentCycleId.toString(),
        nextDeadline: new Date(Number(nextDeadline) * 1000).toLocaleString(),
        members,
        balance: formatEther(balance),
      });
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch contract data. Make sure it is a valid CircleVault contract address on this network!");
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCircleDetails(searchAddress.trim());
  };

  const formatAddr = (addr) => {
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative">
      <Head>
        <title>PayLoop — Public Transparency Explorer</title>
      </Head>

      {/* Header */}
      <header className="w-full bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md px-8 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>💸</span> PayLoop
          </Link>
          <span className="text-xs px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-semibold">
            Transparency Page
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Public Chama Ledger Explorer
            </h1>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Inspect any PayLoop Savings Circle vault balance, cycle deadlines, and active whitelist members instantly.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 bg-zinc-950/40 p-2 border border-zinc-900 rounded-2xl backdrop-blur-md">
            <input
              type="text"
              placeholder="Paste CircleVault contract address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-grow bg-transparent px-4 py-3 rounded-xl font-mono text-sm text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-sm transition-all"
            >
              {isLoading ? "Searching..." : "Inspect Circle"}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Details Block */}
          {circleData && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{circleData.name}</h3>
                  <span className="font-mono text-xs text-zinc-500 mt-1 block break-all">{circleData.address}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block uppercase font-semibold">Vault balance</span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{circleData.balance} MATIC</span>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl">
                  <span className="text-zinc-500 text-xs font-semibold uppercase">Cycle Minimum</span>
                  <p className="text-base font-bold text-white mt-1">{circleData.contributionAmount} MATIC</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl">
                  <span className="text-zinc-500 text-xs font-semibold uppercase">Current Cycle</span>
                  <p className="text-base font-bold text-white mt-1">Cycle #{circleData.currentCycleId}</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl">
                  <span className="text-zinc-500 text-xs font-semibold uppercase">Cycle Deadline</span>
                  <p className="text-xs font-bold text-white mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{circleData.nextDeadline}</p>
                </div>
              </div>

              {/* Members Whitelist */}
              <div className="mt-2">
                <h4 className="font-bold text-zinc-300 mb-3 text-sm uppercase tracking-wider">Anonymized Chama Members</h4>
                <div className="border border-zinc-900 rounded-2xl divide-y divide-zinc-900 max-h-56 overflow-y-auto">
                  {circleData.members.length === 0 ? (
                    <div className="p-4 text-center text-zinc-650 text-xs">No active members registered.</div>
                  ) : (
                    circleData.members.map((m, idx) => (
                      <div key={m} className="p-4 flex justify-between items-center bg-zinc-950/50">
                        <span className="font-mono text-xs text-zinc-300">{formatAddr(m)}</span>
                        <span className="text-xs px-2.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-850 rounded-full">
                          Member #{idx + 1}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900 text-center text-zinc-600 text-xs z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 PayLoop. Public Explorer.</p>
        <p>Polygon Amoy Testnet Ledger</p>
      </footer>
    </div>
  );
}
