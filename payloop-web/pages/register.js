import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1); // 1: Personal, 2: Security & Credentials, 3: OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration State
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Not Specified");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [county, setCounty] = useState("");
  const [occupation, setOccupation] = useState("");

  // OTP Verification State
  const [emailOtp, setEmailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState(""); // Captures the generated OTP code for easy sandbox verification

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form step navigation & validation
  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!name || !idNumber || !dob) {
        setError("Please complete all personal profile fields.");
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  // Trigger OTP sending & move to verification screen
  const triggerOtpAndProceed = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !phone || !password || !confirmPassword) {
      setError("Please complete all credentials and contact fields.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Trigger OTP creation on the backend
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch verification code");
      }

      // Capture sandbox auto-fill OTP code
      if (data.otp) {
        setSandboxOtp(data.otp);
      }

      setIsLoading(false);
      setStep(3);
      alert("Verification code has been dispatched. Check the helper bubble for sandbox testing.");
    } catch (err) {
      setError(err.message || "Failed to send OTP code");
      setIsLoading(false);
    }
  };

  // Submit final registration after verifying OTP
  const verifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!emailOtp || !smsOtp) {
      setError("Please enter the email and SMS OTP codes.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verify OTP
      const verifyResponse = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: emailOtp })
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Verification failed. Invalid OTP code.");
      }

      // 2. Perform actual registration
      const regResponse = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          password,
          dob,
          gender,
          county,
          occupation,
          bio: `Member of PayLoop ecosystem. ID: ${idNumber}`,
          referralCode
        })
      });

      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || "Registration failed");
      }

      // Success - Save details and log in!
      localStorage.setItem("payloop_user_token", regData.token);
      localStorage.setItem("payloop_user", JSON.stringify(regData.user));
      
      setIsLoading(false);
      alert("Registration completed successfully! Welcome to your digital cooperative wallet. 🎉");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to complete verification");
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">💸</span>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            PayLoop
          </span>
        </Link>
        <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-semibold transition-colors">
          Sign In
        </Link>
      </header>

      {/* Main Registration Wizard */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-lg bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-t-3xl" />

          {/* Steps Stepper Header */}
          <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-5">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase block">Step {step} of 3</span>
              <h1 className="text-xl font-extrabold text-white">
                {step === 1 && "Personal Information"}
                {step === 2 && "Setup Credentials"}
                {step === 3 && "Account Verification"}
              </h1>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? "bg-emerald-500" : "bg-zinc-800"}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? "bg-teal-400" : "bg-zinc-800"}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 3 ? "bg-indigo-400" : "bg-zinc-800"}`} />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/10 text-rose-400 text-xs rounded-xl mb-5 text-center font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  National ID / Passport Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 32049182"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors"
                  >
                    <option value="Not Specified">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    County (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uasin Gishu"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Occupation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agronomist"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all text-sm mt-4 font-extrabold"
              >
                Continue to Step 2
              </button>
            </div>
          )}

          {/* STEP 2: CREDENTIALS & SECURITY */}
          {step === 2 && (
            <form onSubmit={triggerOtpAndProceed} className="flex flex-col gap-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. member@payloop.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +254 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PL-REF-9023"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-grow py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-xl text-sm active:scale-95 transition-all"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <form onSubmit={verifyAndRegister} className="flex flex-col gap-5">
              {sandboxOtp && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-2xl text-xs flex flex-col items-center justify-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Sandbox Auto-Fill Helper</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Email OTP Generated:</span>
                    <strong className="font-mono text-sm tracking-wider text-indigo-300">{sandboxOtp}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailOtp(sandboxOtp);
                        setSmsOtp("123456"); // Simulated phone OTP
                      }}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-md font-semibold transition-all"
                    >
                      Auto Fill Both
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email OTP Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit email OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-center text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono tracking-[0.2em]"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  SMS OTP Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit SMS OTP"
                  value={smsOtp}
                  onChange={(e) => setSmsOtp(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-center text-white focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-colors font-mono tracking-[0.2em]"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-grow py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-xl text-sm active:scale-95 transition-all"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-zinc-650 text-xs z-10">
        © 2026 PayLoop Platform.
      </footer>
    </div>
  );
}
