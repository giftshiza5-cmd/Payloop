import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function Login() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 2FA simulation states
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  
  // Device notification simulator
  const [deviceAlert, setDeviceAlert] = useState("");

  useEffect(() => {
    setMounted(true);
    // Simulate checking device recognition
    const rand = Math.random();
    if (rand > 0.7) {
      setDeviceAlert("⚠️ Unrecognized device detected. 2-Step Verification will be required.");
    } else {
      setDeviceAlert("🛡️ Device recognized: Eldoret, Web Browser (Safe session)");
    }
  }, []);

  // Handle standard submit
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter your username and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if 2FA is needed
      if (deviceAlert.includes("Unrecognized") && !showTwoFactor) {
        setShowTwoFactor(true);
        setIsLoading(false);
        alert("Verification code sent! (Simulation: Enter any 6 digits)");
        return;
      }

      // Success
      localStorage.setItem("payloop_user_token", data.token);
      localStorage.setItem("payloop_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email, phone, or password");
      setIsLoading(false);
    }
  };

  // Quick sandbox login
  const handlePresetLogin = (email, pwd) => {
    setUsername(email);
    setPassword(pwd);
    // Auto submit in a moment
    setTimeout(() => {
      setError("");
      setIsLoading(true);
      fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pwd })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          localStorage.setItem("payloop_user_token", data.token);
          localStorage.setItem("payloop_user", JSON.stringify(data.user));
          router.push("/dashboard");
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    }, 200);
  };

  // Google Login simulator
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      // Simulate logging in John Kamau
      handlePresetLogin("johnkamau@gmail.com", "123456");
    }, 1200);
  };

  // Biometric Login simulator
  const handleBiometricLogin = () => {
    setIsLoading(true);
    setError("");
    // Simulate TouchID/FaceID pop up
    alert("Simulating Biometrics: Scanning Face/Fingerprint...");
    setTimeout(() => {
      // Login Mary Wanjiku
      handlePresetLogin("wanjiku@savers.ke", "123456");
    }, 1000);
  };

  // Wallet Login helper
  useEffect(() => {
    if (isConnected && address && mounted) {
      // If connected, let's check if the user is registered with this wallet address.
      // For sandbox simplicity, if connected, they can log in directly as John Kamau (linked to John's seed address)
      // or Treasurer (linked to Treasurer's seed address).
      const checkWalletAndLogin = async () => {
        setIsLoading(true);
        try {
          // Check if wallet address is Treasurer
          if (address.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase()) {
            handlePresetLogin("treasurer@chama.org", "123456");
          } else if (address.toLowerCase() === "0x90f79bf6eb2c4f870365e785982e1f101e93b906".toLowerCase()) {
            handlePresetLogin("johnkamau@gmail.com", "123456");
          } else if (address.toLowerCase() === "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc".toLowerCase()) {
            handlePresetLogin("wanjiku@savers.ke", "123456");
          } else {
            // Unrecognized address, register/mock login
            setError("MetaMask wallet connected but not registered to a PayLoop profile. Please register first.");
            setIsLoading(false);
          }
        } catch (e) {
          setIsLoading(false);
        }
      };
      checkWalletAndLogin();
    }
  }, [isConnected, address]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">💸</span>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            PayLoop
          </span>
        </Link>
        <Link href="/register" className="text-zinc-400 hover:text-white text-sm font-semibold transition-colors">
          Create account
        </Link>
      </header>

      {/* Login Card */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-t-3xl" />
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
            <p className="text-zinc-400 text-xs mt-1.5">Sign in to switch chamas, save, and check loans</p>
          </div>

          {deviceAlert && (
            <div className={`p-3 rounded-xl text-center text-xs mb-5 border font-medium transition-all ${
              deviceAlert.includes("Safe") 
                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80" 
                : "bg-amber-500/5 border-amber-500/10 text-amber-400/80"
            }`}>
              {deviceAlert}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/10 text-rose-400 text-xs rounded-xl mb-5 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {!showTwoFactor ? (
              <>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. member@payloop.ke"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      Password or PIN
                    </label>
                    <a href="#" className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors">
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between mt-1 mb-2">
                  <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded border-zinc-800"
                    />
                    Remember my device
                  </label>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 text-center">
                  2-Factor Authentication Code
                </label>
                <p className="text-zinc-500 text-center text-xs mb-4">Enter the 6-digit code sent to your registered device.</p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value);
                    if (e.target.value.length === 6) {
                      handleLoginSubmit();
                    }
                  }}
                  className="w-full text-center bg-zinc-900/50 border border-zinc-850 px-4 py-4 rounded-xl text-lg tracking-[0.7em] text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/5 active:scale-[0.98] transition-all text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : showTwoFactor ? (
                "Verify Code"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Social / Alternate logins */}
          {!showTwoFactor && (
            <div className="mt-8 flex flex-col gap-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-widest">Or login via</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl text-zinc-300 hover:text-white text-xs font-semibold transition-all"
                >
                  🌐 Google
                </button>
                
                <button
                  onClick={handleBiometricLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl text-zinc-300 hover:text-white text-xs font-semibold transition-all"
                >
                  🧬 Biometrics
                </button>
              </div>

              <div className="mt-2 text-center">
                {/* MetaMask / Web3 Integration */}
                <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Web3 Wallet Connection</span>
                  <div className="inline-block scale-95 origin-center">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sandbox Profiles (For easy testing) */}
        <div className="w-full max-w-md mt-6 bg-zinc-950/20 border border-zinc-900/80 rounded-2xl p-5 backdrop-blur-md">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-3 text-center">
            🔐 Hackathon Sandbox Quick-Access Profiles
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handlePresetLogin("treasurer@chama.org", "123456")}
              className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-left text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <span className="font-semibold">👤 Treasurer (Admin of Eldoret Circle)</span>
              <span className="text-[10px] text-zinc-500 font-mono">123456</span>
            </button>
            <button
              onClick={() => handlePresetLogin("johnkamau@gmail.com", "123456")}
              className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-left text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <span className="font-semibold">👨‍🌾 John Kamau (Member of Eldoret/Farmers)</span>
              <span className="text-[10px] text-zinc-500 font-mono">123456</span>
            </button>
            <button
              onClick={() => handlePresetLogin("wanjiku@savers.ke", "123456")}
              className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-left text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <span className="font-semibold">👩‍🌾 Mary Wanjiku (Admin of Welfare, Member of Eldoret)</span>
              <span className="text-[10px] text-zinc-500 font-mono">123456</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-zinc-650 text-xs z-10">
        © 2026 PayLoop Platform.
      </footer>
    </div>
  );
}
