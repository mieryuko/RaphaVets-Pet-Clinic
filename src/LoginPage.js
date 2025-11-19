import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios";
import FormMessage from "./user-pages/components/FormMessage";
import LandingAnimation from "./LandingAnimation";

function LoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Password reset states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [formMessage, setFormMessage] = useState({ message: "", type: "" });
  const [emailMessage, setEmailMessage] = useState({ message: "", type: "" });
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const openForgot = () => {
    setFpEmail("");
    setEmailModalOpen(true);
    setEmailMessage({ message: "", type: "" });
  };

  // Send password reset link via email
  const submitEmail = async (e) => {
    e?.preventDefault();
    if (!fpEmail) {
      setEmailMessage({ message: "Please enter your email address.", type: "error" });
      return;
    }
    
    setSending(true);
    setEmailMessage({ message: "", type: "" });

    try {
      // Check if email exists
      const checkRes = await api.post("/auth/check-email", { email: fpEmail });
      if (!checkRes.data.exists) {
        setEmailMessage({ message: "Account not found.", type: "error" });
        return;
      }

      // Send password reset email
      const res = await api.post("/auth/forgot-password", { email: fpEmail });
      
      if (res.data.success) {
        setEmailMessage({ message: "✅ Password reset link sent to your email!", type: "success" });
        
        setTimeout(() => {
          setEmailModalOpen(false);
          setShowSuccessModal(true);
          setFpEmail("");
          setEmailMessage({ message: "", type: "" });
        }, 1500);
      } else {
        setEmailMessage({ message: res.data.message || "Failed to send reset link", type: "error" });
      }
      
    } catch (err) {
      console.error("❌ Error sending reset link:", err);
      setEmailMessage({ 
        message: err.response?.data?.message || "Server error. Please try again.", 
        type: "error" 
      });
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMessage({ message: "", type: "" });
    
    try {
      const res = await api.post("/auth/login", loginData);
      console.log("Login response:", res.data);

      // Store all necessary data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id || res.data.user.accId);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Set auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      setFormMessage({ message: "✅ Login successful!", type: "success" });

      // Set user info and show animation
      setUserInfo({
        type: res.data.user.role === 2 ? 'admin' : 'user',
        name: res.data.user.name || res.data.user.username || res.data.user.email
      });
      setShowAnimation(true);
      
    } catch (err) {
      console.error("❌ Login error:", err);
      // Clear any existing auth data on error
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      
      setFormMessage({
        message: err.response?.data?.message || "Server error. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    const role = localStorage.getItem("userRole");
    if (role === "2") {
      navigate("/admin-pages");
    } else if (role === "3") {
      navigate("/vet");
    } else {
      navigate("/user-home");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="hidden md:block md:fixed top-0 left-0 w-[200px] h-[450px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-[30px] -translate-y-[-250px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }} />
      
      <div className="hidden md:block md:fixed top-0 left-0 w-[250px] h-[550px] bg-[#404A4C] border-[15px] border-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-1/4 -translate-y-1/3 z-0 pointer-events-none" />
      
      <img src="/images/white-paws.png" alt="Paws" className="hidden md:block md:fixed top-0 left-0 w-80 h-80 object-cover -translate-x-[25px] -translate-y-[-5px] z-0 pointer-events-none" />
      
      <div className="hidden md:block md:fixed top-0 left-[300px] w-[200px] h-[350px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] translate-x-[0px] -translate-y-[120px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }} />
      
      <div className="hidden md:block md:fixed bottom-0 left-[18%] w-[260px] h-[480px] bg-[#5EE6FE] rounded-tl-[125px] rounded-tr-[125px] transform -rotate-[41.73deg] -translate-x-[-100px] translate-y-[150px] z-30 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #6aa5afff, #5EE6FE)" }} />
      
      <img src="/images/logo.png" alt="Logo" className="hidden md:block md:fixed top-5 right-5 w-24 h-24 object-contain z-40 pointer-events-none" />
      
      {/* Login form wrapper */}
      <div className="relative z-20 w-full md:w-auto min-h-screen flex flex-col items-center justify-center
                    md:absolute md:top-1/2 md:right-8 lg:right-24 md:-translate-y-1/2 overflow-hidden">
        
        {/* Mobile top section */}
        <div className="absolute top-0 left-0 w-full h-[32%] md:hidden overflow-hidden rounded-b-[40px] z-[5]"
          style={{ background: "linear-gradient(145deg,#5EE6FE 0%,#42C4D6 40%,#2FA394 100%)" }}>
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 25%),
                radial-gradient(circle at 80% 40%, rgba(255,255,255,0.25) 0%, transparent 20%),
                radial-gradient(circle at 50% 80%, rgba(255,255,255,0.25) 0%, transparent 20%)`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }} />
          <svg viewBox="0 0 1440 120" className="absolute bottom-0 left-0 w-full h-[70px]">
            <path fill="#F3F3F3" d="M0,64L60,69.3C120,75,240,85,360,96C480,107,600,117,720,101.3C840,85,960,43,1080,32C1200,21,1320,43,1380,53.3L1440,64V120H0Z" />
          </svg>
        </div>

        <div className="flex flex-col items-center justify-end w-full min-h-screen md:min-h-0 md:justify-center md:scale-[0.9] origin-top z-10">

          {/* Cat image */}
          <div className="hidden sm:flex justify-center w-full z-40 pointer-events-none">
            <img
              src="/images/cat_peeking.png"
              alt="Cat"
              className="w-[80px] -mb-1 sm:-mb-2 md:-mb-4 sm:w-[100px] md:w-[120px] lg:w-[140px] object-contain drop-shadow-lg"
            />
          </div>

          {/* Login form */}
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
              {/* Welcome text */}
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

                {/* Email */}
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

                {/* Password */}
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

                {/* Forgot password */}
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
              </form>

              {/* Divider and Create Account */}
              <div className="w-full px-4 sm:px-6">
                <div className="flex items-center my-1">
                  <div className="flex-grow h-[1px] bg-gray-300"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300"></div>
                </div>

                <button
                  onClick={() => setShowCreateAccountModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 sm:py-3 cursor-pointer hover:border-[#5EE6FE] hover:bg-gray-50 transition-all duration-200 font-sansation"
                >
                  <i className="fa-solid fa-user-plus text-[#5EE6FE] text-base"></i>
                  <span className="text-gray-700 text-sm sm:text-base">How to create an account</span>
                </button>
              </div>

              <Link to="/home" className="text-xs sm:text-sm text-gray-500 mt-4 hover:underline inline-block">
                Continue as a guest.
              </Link>
            </div>
          </div>
      </div>

      {/* Forgot Password Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEmailModalOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E6F8FB] p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Baloo Chettan 2'" }}>
              Reset Password
            </h3>
            <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send you a password reset link.</p>
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
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setEmailModalOpen(false)}
                >
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccessModal(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E6F8FB] p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-envelope text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email!</h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to your email address. 
                Please check your inbox and click the link to reset your password.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateAccountModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5EE6FE] rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-user-plus text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Account Creation</h3>
                  <p className="text-gray-500 text-sm mt-1">Requirements for online access</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-info-circle text-blue-500 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-blue-800 font-medium text-sm">To create an online account, you must:</p>
                    <p className="text-blue-700 text-sm mt-1">Have at least one completed service with us</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-check text-green-600 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Visit Our Clinic</h4>
                    <p className="text-gray-600 text-sm mt-1">Book and complete any veterinary service</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-check text-green-600 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Request Online Access</h4>
                    <p className="text-gray-600 text-sm mt-1">Ask our staff to activate your online account</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-check text-green-600 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Receive Credentials</h4>
                    <p className="text-gray-600 text-sm mt-1">Get your login details after service completion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCreateAccountModal(false)}
                  className="flex-1 border border-gray-300 bg-white text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    navigate('/home');
                  }}
                  className="flex-1 bg-[#5EE6FE] text-white py-3 rounded-lg hover:bg-[#3ecbe0] transition-all font-medium text-sm"
                >
                  View Services
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showAnimation && (
        <LandingAnimation
          userType={userInfo?.type}
          userName={userInfo?.name}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}

export default LoginPage;