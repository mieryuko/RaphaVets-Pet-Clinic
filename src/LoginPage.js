import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios";
import FormMessage from "./user-pages/components/FormMessage";

function LoginPage() {

  const navigate = useNavigate();
  const [loginData, setLoginData] = useState( { email: "", password: "" });
  const [loading, setLoading] = useState(false);
  // forgot-password / verification modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [formMessage, setFormMessage] = useState({ message: "", type: "" });
  const [emailMessage, setEmailMessage] = useState({ message: "", type: "" });
  const [verifyMessage, setVerifyMessage] = useState({ message: "", type: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const DIGITS = 6;
  const [codeDigits, setCodeDigits] = useState(Array(DIGITS).fill(""));
  const inputsRef = useRef(Array(DIGITS).fill(null));

  const [seconds, setSeconds] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!verifyModalOpen) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setSeconds(60);
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

  const openForgot = () => {
    setFpEmail("");
    setCodeDigits(Array(DIGITS).fill(""));
    setEmailModalOpen(true);
  };

  // send verification code
  const submitEmail = async (e) => {
    e?.preventDefault();
    if (!fpEmail) return;
    setSending(true);

    try {
      const checkRes = await api.post("/auth/check-email", { email: fpEmail });
      if (!checkRes.data.exists) {
        setEmailMessage({ message: "Account not found.", type: "error" });
        return;
      }

      const res = await api.post("/auth/send-code", { email: fpEmail });
      if (res.data.success) {
        setEmailMessage({ message: "✅ Verification code sent to your email", type: "success" });
        setTimeout(() => {
          setEmailModalOpen(false);
          setShowSuccessModal(true);
          setSeconds(60);
          setTimeout(() => inputsRef.current[0]?.focus(), 120);
          setEmailMessage({ message: "", type: "" });
        }, 1000);
      } else {
        setEmailMessage({ message: res.data.message || "Failed to send code", type: "error" });
      }
    } catch (err) {
      console.error("❌ Error sending code:", err);
      setEmailMessage({ message: err.response?.data?.message || "Server error", type: "error" });
    } finally {
      setSending(false);
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", loginData);
      console.log("Login response:", res.data); // Debug log

      // Store all necessary data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id || res.data.user.accId);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // IMPORTANT: ensure api instance sends the header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      setFormMessage({ message: "✅ Login successful!", type: "success" });

      // ✅ Redirect based on role
      setTimeout(() => {
        const role = res.data.user.role;
        if (role === 2) {
          navigate("/admin-pages");
        } else {
          navigate("/user-home");
        }
      }, 1000);
    } catch (err) {
      console.error("❌ Login error:", err);
      // Clear any existing auth data on error
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      
      setFormMessage({
        message: err.response?.data?.message || "Server error",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // confirm verification code
  const confirmCode = async (e) => {
    e?.preventDefault();
    const code = codeDigits.join("");

    if (code.length !== DIGITS) {
      setVerifyMessage({ message: "Please enter the full 6-digit code.", type: "error" });
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/auth/verify-code", { email: fpEmail, code });
      if (res.data.success) {
        setVerifyMessage({ message: "✅ Code verified successfully!", type: "success" });

        setTimeout(() => {
          setVerifyModalOpen(false);
          setVerifyMessage({ message: "", type: "" });
          setCodeDigits(Array(DIGITS).fill(""));
          setShowSuccessModal(true); // 👈 show new success modal
        }, 1200);
      } else {
        setVerifyMessage({ message: res.data.message || "Invalid code", type: "error" });
      }
    } catch (err) {
      console.error("❌ Code verification error:", err);
      setVerifyMessage({
        message: err.response?.data?.message || "Server error",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };


  // resend code
  const resendCode = async () => {
    if (seconds > 0) return;
    setSending(true);
    try {
      const res = await api.post("/auth/send-code", { email: fpEmail });
      if (res.data.success) {
        setVerifyMessage({ message: "✅ Verification code resent to your email", type: "success" });
        setSeconds(60);
        setCodeDigits(Array(DIGITS).fill(""));
        setTimeout(() => inputsRef.current[0]?.focus(), 80);
      } else {
        setVerifyMessage({ message: res.data.message || "Failed to resend code", type: "error" });
      }
    } catch (err) {
      console.error("❌ Resend code error:", err);
      setVerifyMessage({
        message: err.response?.data?.message || "Server error",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* left */}
      <div
        className="hidden md:block md:fixed top-0 left-0 w-[200px] h-[450px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-[30px] -translate-y-[-250px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }}
      />

      {/* center */}
      <div className="hidden md:block md:fixed top-0 left-0 w-[250px] h-[550px] bg-[#404A4C] border-[15px] border-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-1/4 -translate-y-1/3 z-0 pointer-events-none" />

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
      />

      {/* bottom */}
      <div
        className="hidden md:block md:fixed bottom-0 left-[18%] w-[260px] h-[480px] bg-[#5EE6FE] rounded-tl-[125px] rounded-tr-[125px] transform -rotate-[41.73deg] -translate-x-[-100px] translate-y-[150px] z-30 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #6aa5afff, #5EE6FE)" }}
      />

      {/* logo */}
      <img src="/images/logo.png" alt="Logo" className="hidden md:block md:fixed top-5 right-5 w-24 h-24 object-contain z-40 pointer-events-none" />
      
      
      {/* wrapper */}
      <div
        className="relative z-20 w-full md:w-auto min-h-screen flex flex-col items-center justify-center
                    md:absolute md:top-1/2 md:right-8 lg:right-24 md:-translate-y-1/2 overflow-hidden"
      >

        {/* mobile top section */}
        <div
          className="absolute top-0 left-0 w-full h-[32%] md:hidden overflow-hidden rounded-b-[40px] z-[5]"
          style={{
            background: "linear-gradient(145deg,#5EE6FE 0%,#42C4D6 40%,#2FA394 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 25%),
                radial-gradient(circle at 80% 40%, rgba(255,255,255,0.25) 0%, transparent 20%),
                radial-gradient(circle at 50% 80%, rgba(255,255,255,0.25) 0%, transparent 20%)`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          />

          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-[70px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#F3F3F3"
              d="M0,64L60,69.3C120,75,240,85,360,96C480,107,600,117,720,101.3C840,85,960,43,1080,32C1200,21,1320,43,1380,53.3L1440,64V120H0Z"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center justify-end w-full min-h-screen md:min-h-0 md:justify-center md:scale-[0.9] origin-top z-10">

          {/* cat image */}
          <div className="hidden sm:flex justify-center w-full z-40 pointer-events-none">
            <img
              src="/images/cat_peeking.png"
              alt="Cat"
              className="w-[80px] -mb-1 sm:-mb-2 md:-mb-4 sm:w-[100px] md:w-[120px] lg:w-[140px] object-contain drop-shadow-lg"
            />
          </div>

          {/* login form */}
          <div
            className="bg-[#F3F3F3] border-t-0 md:border-[1.5px] border-[#5EE6FE] shadow-none md:shadow-2xl 
                      w-full sm:w-[90%] md:w-[480px] lg:w-[560px] max-w-[560px]
                      flex flex-col items-center justify-start relative
                      pt-8 sm:pt-10 md:pt-6 p-5 sm:p-6 md:p-6 lg:p-8
                      gap-2 text-sm rounded-t-[40px] md:rounded-3xl overflow-hidden"
            style={{
              minHeight: "75vh",
              boxSizing: "border-box",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
              {/* welcome txt */}
              <div className="w-full flex items-center mb-2 px-2 sm:px-0 sm:py-2 md:py-3">
                <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
                <h1 className="mx-3 sm:mx-6 text-[20px] sm:text-[20px] md:text-[25px] font-bold text-gray-800" style={{ fontFamily: "'Baloo Chettan 2'" }}>
                  Welcome
                </h1>
                <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
              </div> 

              <div className="text-gray-600 text-center mb-6 text-sm sm:text-base">
                Login to your account to continue
              </div>       

              <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4 w-full px-4 sm:px-6">
                <FormMessage type={formMessage.type} message={formMessage.message} />

                {/* email */}
                <div className="flex items-center bg-[#EAEAEA] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE]">
                  <div className="flex items-center px-3 text-gray-500">
                    <i className="fa-solid fa-user text-[#626262]"></i>
                    <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                  </div>
                    <input
                      type="email"
                      autoComplete="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="abcd@xyz.com"
                      className="flex-1 py-2 sm:py-3 pr-3 outline-none bg-[#EAEAEA] text-gray-700 text-sm sm:text-base"
                    />            
                  </div>

                {/* password */}
                <div className="flex items-center bg-[#EAEAEA] border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5EE6FE] font-sansation">
                  <div className="flex items-center px-3 text-gray-500">
                    <i className="fa-solid fa-lock text-[#626262]"></i>
                    <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                  </div>

                    <input
                      type="password"
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Password"
                      className="flex-1 py-2 sm:py-3 pr-3 outline-none bg-[#EAEAEA] text-[#404A4C] text-sm sm:text-base"
                    />

                  <button
                    type="button"
                    className="px-3 text-[#626262] hover:text-[#5EE6FE] focus:outline-none"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling;
                      input.type = input.type === "password" ? "text" : "password";
                      e.currentTarget.firstChild.classList.toggle("fa-eye");
                      e.currentTarget.firstChild.classList.toggle("fa-eye-slash");
                    }}
                  >
                    <i className="fa-solid fa-eye-slash"></i>
                  </button>
                </div>

                {/* forgot password */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-xs sm:text-sm text-[#4E4E4E] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="text-center bg-[#5EE6FE] text-white font-semibold py-2 sm:py-3 rounded-xl mt-1 hover:bg-[#388A98] transition-colors"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                {/* divider */}
                <div className="flex items-center my-1">
                  <div className="flex-grow h-[1px] bg-gray-300"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300"></div>
                </div>

                {/* google */}
                <div className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 sm:py-3 cursor-pointer hover:bg-gray-100 transition-colors font-sansation">
                  <img
                      src="/images/g-logo.png"
                      alt="Google logo"
                      className="w-5 h-5"
                    />
                  <span className="text-[#404A4C] text-sm sm:text-base">Continue with Google account</span>
                </div>
              </form>

              {/* signup link 
              <p className="text-xs sm:text-sm text-gray-500 mt-4">
                Don't have an account? <Link to="/signup" className="text-[#5EE6FE] font-semibold">Sign up</Link>
              </p>
              */}
              
              <Link to="/home" className="text-xs sm:text-sm text-gray-500 mt-4 hover:underline inline-block">
                Continue as a guest.
              </Link>
            </div>
          </div>
      </div>

      {/* forgot password email modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEmailModalOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E6F8FB] p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Baloo Chettan 2'" }}>
              Reset password
            </h3>
            <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send a verification code.</p>
            <form onSubmit={submitEmail} className="flex flex-col gap-3">
              
              <FormMessage type={emailMessage.type} message={emailMessage.message} />
              
              <input
                type="email"
                required
                autoFocus
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full py-2 px-3 rounded-lg bg-[#F5F7F8] border border-gray-200 outline-none"
              />

              <div className="flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 rounded-lg" onClick={() => setEmailModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] disabled:opacity-60"
                  disabled={!fpEmail || sending}
                >
                  {sending ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* verification modal 
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
              
              <FormMessage type={verifyMessage.type} message={verifyMessage.message} />
              
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
      */}

      {/* success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccessModal(false)} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E6F8FB] p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="bg-[#5EE6FE]/10 text-[#5EE6FE] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-envelope-open-text text-3xl"></i>
              </div>
              <h3
                className="text-xl font-bold text-gray-800 mb-2"
                style={{ fontFamily: "'Baloo Chettan 2'" }}
              >
                Check your email!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a link to your email account for resetting your password.
                Please check your inbox and follow the instructions to continue.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] transition-all duration-300"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default LoginPage;
