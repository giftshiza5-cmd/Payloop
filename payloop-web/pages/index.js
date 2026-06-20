import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import ConnectButton from "../components/ConnectButton";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <Head>
        <title>PayLoop — Digital Chama & Cooperative Savings Ecosystem</title>
        <meta
          name="description"
          content="Modern multi-group ecosystem for SACCOs, Chamas, and Investment Clubs. Secure savings, credit reputation, and micro-lending."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💸</span>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
            PayLoop
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/transparency" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors hidden md:block">
            Transparency Ledger
          </Link>
          <div className="h-4 w-px bg-zinc-800 hidden md:block" />
          <Link href="/login" className="text-zinc-300 hover:text-white text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-xl shadow-lg shadow-emerald-500/10 text-sm active:scale-95 transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-850 text-xs text-emerald-400 font-semibold tracking-wide uppercase shadow-inner shadow-black/40">
            🚀 Multi-Group Savings & Lending Ecosystem
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            The Digital Wallet Built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Chamas & SACCOs
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Move your savings circles, investment clubs, and welfare groups into a secure, transparent digital ecosystem. Track your reputation score, save weekly, and request group-approved loans.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link
              href="/register"
              className="px-8 py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl shadow-xl shadow-white/5 active:scale-95 transition-all w-full sm:w-auto"
            >
              Get Started Now
            </Link>
            
            <Link
              href="/login"
              className="px-8 py-4 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white rounded-2xl font-semibold backdrop-blur-md transition-all active:scale-95 w-full sm:w-auto"
            >
              Member Sign In →
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
            {/* Feature 1 */}
            <div className="bg-zinc-950/30 border border-zinc-900/80 hover:border-zinc-850 p-6 rounded-2xl backdrop-blur-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Group ecosystem</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Join multiple chamas, investment groups, or cooperative societies. Access a personalized dashboard for each group, keeping records completely separated.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950/30 border border-zinc-900/80 hover:border-zinc-850 p-6 rounded-2xl backdrop-blur-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-lg font-bold text-white mb-2">PayLoop Multi-Wallet</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Receive an automatic internal PayLoop Wallet. Link external accounts including M-Pesa, bank accounts, or MetaMask, and easily move funds between them.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950/30 border border-zinc-900/80 hover:border-zinc-850 p-6 rounded-2xl backdrop-blur-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Member Reputation Scoring</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Build a verifiable savings reputation score (`CreditLoop`). On-time weekly deposits raise your score and lower your interest rates for chama micro-loans.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-950 text-center text-zinc-650 text-xs z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <p>© 2026 PayLoop Platform. Digitizing cooperatives and community-led savings.</p>
        <div className="flex gap-6">
          <Link href="/transparency" className="hover:text-zinc-400 transition-colors">Ledger Explorer</Link>
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
