import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "./api/axios";

function SignupPage() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[*\-@\$]/.test(password);
  const matches = password !== "" && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations first
    if (!firstName || !lastName || !email || !password || !confirm) {
      return alert("Please fill out all fields.");
    }
    if (password !== confirm) {
      return alert("Passwords do not match.");
    }
    if (!hasUpper || !hasLower || !hasLength || !hasSpecial) {
      return alert("Password does not meet all requirements.");
    }

    try {
      // ✅ Step 1: Check if email already exists
      const check = await api.post("/auth/check-email", { email });

      if (check.data.exists) {
        return alert("This email is already registered. Please use a different one.");
      }

      // ✅ Step 2: Proceed only if email not registered
      setPendingUser({ firstName, lastName, email, password });
      setFpEmail(email);
      setVerifyModalOpen(true);
      setSeconds(60);

      // ✅ Step 3: Send verification code
      await api.post("/auth/send-code", { email });
      console.log("✅ Verification code sent to:", email);

    } catch (err) {
      console.error("❌ Error during signup:", err);
      alert(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };



  const itemClass = (ok) =>
    `flex items-start gap-2 text-xs ${ok ? "text-green-600" : "text-gray-400"}`;

  // verification modal
  const DIGITS = 6;
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [codeDigits, setCodeDigits] = useState(Array(DIGITS).fill(""));
  const inputsRef = useRef([]);
  const [seconds, setSeconds] = useState(60);
  const timerRef = useRef(null);

  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    if (!verifyModalOpen) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setSeconds(60);
      setCodeDigits(Array(DIGITS).fill(""));
    }
  }, [verifyModalOpen]);

  useEffect(() => {
    if (verifyModalOpen && seconds > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {};
  }, [verifyModalOpen, seconds]);

  const handleDigitInput = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...codeDigits];
    next[idx] = val;
    setCodeDigits(next);
    if (val && idx < DIGITS - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !codeDigits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      const next = [...codeDigits];
      next[idx - 1] = "";
      setCodeDigits(next);
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < DIGITS - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^\d{2,}$/.test(paste)) return;
    const arr = paste.slice(0, DIGITS).split("");
    const next = Array(DIGITS).fill("");
    for (let i = 0; i < arr.length; i++) next[i] = arr[i];
    setCodeDigits(next);
    const last = Math.min(arr.length - 1, DIGITS - 1);
    setTimeout(() => inputsRef.current[last]?.focus(), 0);
    e.preventDefault();
  };

  const resendCode = async () => {
    if (seconds > 0) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSeconds(60);
    setCodeDigits(Array(DIGITS).fill(""));
    setTimeout(() => inputsRef.current[0]?.focus(), 80);
  };

  const confirmCode = async (e) => {
    e.preventDefault();
    const code = codeDigits.join("");
    if (code.length !== 6) return alert("Please enter all 6 digits.");

    try {
      const res = await api.post("/auth/verify-code", { email: fpEmail, code });

      if (res.data.success) {
        const registerRes = await api.post("/auth/register", pendingUser);
        console.log("✅ User registered:", registerRes.data);
        alert("Account created successfully!");
        setVerifyModalOpen(false);
      } else {
        alert("Invalid code.");
      }
    } catch (err) {
      console.error("❌ Verification error:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 400 && data.message === "Email already registered") {
          alert("This email is already registered.");
        } else if (status === 400 && data.message === "Invalid email or password") {
          alert("Invalid email or password.");
        } else {
          alert(data.message || "Something went wrong. Try again.");
        }
      } else {
        alert("Network error. Please try again.");
      }
    }
  };


  // end verification modal

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* left */}
      <div
        className="hidden md:block md:fixed top-0 left-0 w-[200px] h-[450px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-[30px] -translate-y-[-250px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }}
      ></div>

      {/* center */}
      <div className="hidden md:block md:fixed top-0 left-0 w-[250px] h-[550px] bg-[#404A4C] border-[15px] border-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-1/4 -translate-y-1/3 z-0 pointer-events-none"></div>

      {/* Paw */}
      <img
        src="/images/white-paws.png"
        alt="Paws"
        className="hidden md:block md:fixed top-0 left-0 w-80 h-80 object-cover -translate-x-[25px] -translate-y-[-5px] z-0 pointer-events-none"
      />

      {/* right */}
      <div
        className="hidden md:block md:fixed top-0 left-[300px] w-[200px] h-[350px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] translate-x-[0px] -translate-y-[120px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }}
      ></div>

      {/* bottom */}
      <div
        className="hidden md:block md:fixed bottom-0 left-[18%] w-[260px] h-[480px] bg-[#5EE6FE] rounded-tl-[125px] rounded-tr-[125px] transform -rotate-[41.73deg] -translate-x-[-10px] translate-y-[150px] z-30 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #6aa5afff, #5EE6FE)" }}
      ></div>

      {/* logo */}
      <img src="/images/logo.png" alt="Logo" className="hidden md:block md:fixed top-5 right-5 w-24 h-24 object-contain z-40 pointer-events-none" />

      {/* wrapper*/}
      <div
        className="relative z-20 w-full md:w-auto min-h-screen flex flex-col items-center justify-center
                  py-4 sm:py-8 md:py-0
                  md:absolute md:top-1/2 lg:right-48 md:right-8 md:-translate-y-1/2"
      >
        {/* cat image */}
        <div className="hidden sm:flex justify-center w-full z-40 pointer-events-none">
          <img
            src="/images/cat_peeking.png"
            alt="Cat"
            className="w-[80px] -mb-1 sm:-mb-2 md:-mb-4 sm:w-[100px] md:w-[120px] lg:w-[140px] object-contain drop-shadow-lg"
          />
        </div>

        {/* signup form*/}
        <div
          className="bg-[#F3F3F3] border-[1.5px] border-[#5EE6FE] shadow-2xl rounded-3xl 
                    w-[95%] sm:w-[90%] md:w-[70%] lg:w-[600px] max-w-[600px]
                    flex flex-col items-center justify-start relative z-10
                    pt-4 sm:pt-6 md:pt-8 p-4 sm:p-6 md:p-8 lg:p-10
                    gap-2 sm:gap-3 md:gap-2 text-sm
                    max-h-[calc(100vh-90px)] sm:max-h-[calc(100vh-110px)] md:max-h-[calc(100vh-140px)] overflow-y-auto"
          style={{
            boxSizing: "border-box",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
           }}
        >
          {/* welcome txt */}
          <div className="w-full flex items-center mb-1 sm:mb-2 sm:mt-2 px-2 sm:px-0">
            <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
            <h1
              className="mx-3 sm:mx-6 text-[20px] sm:text-[20px] md:text-[25px] font-bold text-gray-800"
              style={{ fontFamily: "'Baloo Chettan 2'" }}
            >
              Create an account
            </h1>
            <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
          </div>

          <div className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">Sign up with google account</div>

          <form className="flex flex-col gap-1 sm:gap-2 w-full px-4 sm:px-6" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center bg-[#EAEAEA] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                  <div className="flex items-center px-3 text-gray-500">
                    <i className="fa-solid fa-user text-[#626262]"></i>
                    <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                  </div>
                  <input
                    aria-label="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    placeholder="First name"
                    className="w-full py-1 sm:py-2 md:py-3 pr-2 sm:pr-3 outline-none bg-[#EAEAEA] text-gray-700 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center bg-[#EAEAEA] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                  <div className="flex items-center px-3 text-gray-500">
                    <i className="fa-solid fa-user text-[#626262]"></i>
                    <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                  </div>
                  <input
                    aria-label="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    placeholder="Last name"
                    className="w-full py-1 sm:py-2 md:py-3 pr-2 sm:pr-3 outline-none bg-[#EAEAEA] text-gray-700 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* email */}
            <div>
              <div className="flex items-center bg-[#EAEAEA] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                <div className="flex items-center px-3 text-gray-500">
                  <i className="fa-solid fa-envelope text-[#626262]"></i>
                  <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                </div>
                <input
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="abcd@gmail.com"
                  className="flex-1 py-2 sm:py-3 md:py-4 pr-3 outline-none bg-[#EAEAEA] text-gray-700 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <div className="flex items-center bg-[#EAEAEA] border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                <div className="flex items-center px-3 text-gray-500">
                  <i className="fa-solid fa-lock text-[#626262]"></i>
                  <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                </div>
                <input
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  className="flex-1 py-1 sm:py-2 md:py-3 pr-2 sm:pr-3 outline-none bg-[#EAEAEA] text-[#404A4C] text-sm sm:text-base"
                />
                <button
                  type="button"
                  className="px-3 text-[#626262] hover:text-[#5EE6FE] focus:outline-none"
                  onClick={() => setShowPwd((s) => !s)}
                >
                  <i className={`fa-solid ${showPwd ? "fa-eye" : "fa-eye-slash"}`}></i>
                </button>
              </div>

              {/* password requirements */}
              <div className="mt-1 sm:mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-gray-400 text-xs">
                  <div className={itemClass(hasUpper)}>
                    <i className={`fa-solid ${hasUpper ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}></i>
                    <span className="text-[11px]">Password must contain at least one uppercase letter.</span>
                  </div>
                  <div className={itemClass(hasLength)}>
                    <i className={`fa-solid ${hasLength ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}></i>
                    <span className="text-[11px]">Password must be at least 8 characters long.</span>
                  </div>

                  <div className={itemClass(hasLower)}>
                    <i className={`fa-solid ${hasLower ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}></i>
                    <span className="text-[11px]">Password must contain at least one lowercase letter.</span>
                  </div>
                  <div className={itemClass(hasSpecial)}>
                    <i className={`fa-solid ${hasSpecial ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}></i>
                    <span className="text-[11px]">Password must include at least one special character (*, -, @, $).</span>
                  </div>

                  <div className={itemClass(matches)}>
                    <i className={`fa-solid ${matches ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}></i>
                    <span className="text-[11px]">Password must match the retyped password.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* retype password */}
            <div>
              <div className="flex items-center bg-[#EAEAEA] border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                <div className="flex items-center px-3 text-gray-500">
                  <i className="fa-solid fa-lock text-[#626262]"></i>
                  <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                </div>
                <input
                  aria-label="Retype password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  className="flex-1 py-2 sm:py-3 md:py-4 pr-3 outline-none bg-[#EAEAEA] text-[#404A4C] text-sm sm:text-base"
                />
                <button
                  type="button"
                  className="px-3 text-[#626262] hover:text-[#5EE6FE] focus:outline-none"
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  <i className={`fa-solid ${showConfirm ? "fa-eye" : "fa-eye-slash"}`}></i>
                </button>
              </div>
            </div>

            {/* buttons */}
            <div className="w-full mt-3 flex flex-col sm:flex-row gap-3">
               <button
                 type="button"
                 aria-label="Sign up with Google"
                 className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-2 sm:py-3 shadow-sm hover:shadow-md transition-colors text-sm text-gray-800"
               >
                 <img
                   src="/images/g-logo.png"
                   alt="Google logo"
                   className="w-5 h-5"
                 />
                 <span className="font-medium">Sign up with Google</span>
               </button>
 
 
               <button
                 type="submit"
                 aria-label="Create"
                 className="flex-1 flex items-center justify-center gap-2 bg-[#5EE6FE] text-white font-semibold py-2 sm:py-3 rounded-xl hover:bg-[#388A98] transition-colors text-sm"
               >
                 <span>Sign up</span>
               </button>
             </div>
          </form>

          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Already have an account? <Link to="/" className="text-[#5EE6FE] font-semibold">Login</Link>
          </p>

          <Link to="/home" className="text-xs sm:text-sm text-gray-500 mt-4 hover:underline inline-block">
            Continue as a guest.
          </Link>
        </div>
      </div>

      {/* verification modal*/}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVerifyModalOpen(false)} />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E6F8FB] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo Chettan 2'" }}>
                  Verify your email
                </h3>
                <p className="text-sm text-gray-600 mt-1">We've sent a 6-digit code to <span className="font-medium text-gray-800">{fpEmail || "your email"}</span></p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setVerifyModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={confirmCode} className="mt-6 flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {codeDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    className="w-12 h-12 text-center rounded-lg bg-[#F5F7F8] border border-gray-200 text-lg"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitInput(i, e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={seconds > 0 || sending}
                  className="text-[#5EE6FE] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {seconds > 0 ? `Resend in ${seconds}s` : sending ? "Sending..." : "Resend code"}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] disabled:opacity-60"
                  disabled={codeDigits.join("").length !== DIGITS}
                >
                  Confirm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;