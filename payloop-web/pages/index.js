import Head from "next/head";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import ConnectButton from "../components/ConnectButton";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />

      <Head>
        <title>PayLoop — Decentralized Group Savings & Micro-Lending</title>
        <meta
          name="description"
          content="Chamas on-chain. Secure multi-sig savings circles with peer-voted micro-loans and dynamic credit reputation scoring."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            PayLoop
          </span>
        </div>
        <ConnectButton />
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-xs text-emerald-400 font-semibold tracking-wide uppercase">
            🚀 ELDOHUB WEB3 HACKATHON BUILD
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Decentralize Your Group Savings with{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              PayLoop
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl">
            Bring your savings circles (Chamas) on-chain. Eliminate fraud with multi-sig vaults,
            vote on micro-loans, and build a verifiable credit history with MetaMask.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            {mounted && isConnected ? (
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-white text-black hover:bg-zinc-200 font-semibold rounded-full shadow-lg shadow-white/5 transition-transform active:scale-95 duration-150"
              >
                Enter Admin Dashboard →
              </Link>
            ) : (
              <div className="bg-zinc-900/40 p-1.5 rounded-full border border-zinc-800 backdrop-blur-sm shadow-xl">
                <ConnectButton />
              </div>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full font-medium transition-colors backdrop-blur-sm"
            >
              Explore Protocol Code
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
            {/* Feature 1 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
                🔐
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Treasurer Fraud Proof</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Vault logic rules are enforced by Solidity smart contracts. Withdrawals require
                multiple signatures from group administrators before any funds move.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
                🗳️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Peer-Voted Micro-Loans</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Members request loans directly from the shared pool. Smart contracts lock/unlock
                funds according to voting rules: 1 wallet = 1 vote.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-lg font-bold text-white mb-2">On-Chain Credit Score</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Say goodbye to ignored savings history. Building savings cycles on-chain constructs
                a public reputation metric that drops loan interest rates.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900 text-center text-zinc-600 text-xs z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 PayLoop. Built for Eldohub Web3 Hackathon.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
