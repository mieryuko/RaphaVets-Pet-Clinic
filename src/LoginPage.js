import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/axios";
import FormMessage from "./user-pages/components/FormMessage";
import LandingAnimation from "./LandingAnimation";
import socket from "./socket"; // Import socket

function LoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [formMessage, setFormMessage] = useState({ message: "", type: "" });
  const [emailMessage, setEmailMessage] = useState({ message: "", type: "" });
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation variants for mobile only
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  };

  // Clean up socket on component unmount
  useEffect(() => {
    return () => {
      // Don't disconnect socket on component unmount, just remove listeners
      socket.off('joined_room');
    };
  }, []);

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

      // 🔌 CONNECT SOCKET AFTER LOGIN
      const userId = res.data.user.id || res.data.user.accId;
      console.log('🔌 Connecting socket for user:', userId);
      
      if (!socket.connected) {
        socket.connect();
      }
      
      // Set up one-time listener for join confirmation
      socket.once('joined_room', (data) => {
        console.log('✅ Socket room joined:', data);
      });
      
      // Emit join after a short delay to ensure connection
      setTimeout(() => {
        if (socket.connected) {
          socket.emit('join', userId);
          console.log('🎯 Join emitted for user:', userId);
        } else {
          console.log('⚠️ Socket not connected yet, will retry on connect');
          // Set up listener for connect event
          const onConnect = () => {
            socket.emit('join', userId);
            socket.off('connect', onConnect);
          };
          socket.on('connect', onConnect);
        }
      }, 500);

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
      {/* DESKTOP BACKGROUND ELEMENTS - KEPT EXACTLY THE SAME */}
      <div className="hidden md:block md:fixed top-0 left-0 w-[200px] h-[450px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-[30px] -translate-y-[-250px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }} />
      
      <div className="hidden md:block md:fixed top-0 left-0 w-[250px] h-[550px] bg-[#404A4C] border-[15px] border-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] -translate-x-1/4 -translate-y-1/3 z-0 pointer-events-none" />
      
      <img src="/images/white-paws.png" alt="Paws" className="hidden md:block md:fixed top-0 left-0 w-80 h-80 object-cover -translate-x-[25px] -translate-y-[-5px] z-0 pointer-events-none" />
      
      <div className="hidden md:block md:fixed top-0 left-[300px] w-[200px] h-[350px] bg-[#5EE6FE] rounded-br-[125px] rounded-bl-[125px] transform -rotate-[41.73deg] translate-x-[0px] -translate-y-[120px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #5EE6FE, #6aa5afff)" }} />
      
      <div className="hidden md:block md:fixed bottom-0 left-[18%] w-[260px] h-[480px] bg-[#5EE6FE] rounded-tl-[125px] rounded-tr-[125px] transform -rotate-[41.73deg] -translate-x-[-100px] translate-y-[150px] z-30 pointer-events-none"
        style={{ background: "linear-gradient(5deg, #6aa5afff, #5EE6FE)" }} />
      
      {/* Logo for desktop - KEPT EXACTLY THE SAME */}
      <img src="/images/logo.png" alt="Logo" className="hidden md:block md:fixed top-5 right-5 w-24 h-24 object-contain z-40 pointer-events-none" />
      
      {/* MODERN MOBILE DESIGN - COMPLETELY REDONE FOR MOBILE ONLY */}
      
      {/* Mobile Background - Completely new modern design */}
      <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] to-[#F0F4F8]"></div>
        
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#5EE6FE]/20 to-[#2FA394]/20 rounded-full blur-3xl"
        />
        
        <motion.div 
          animate={{ 
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-tr from-[#5EE6FE]/10 to-[#42C4D6]/20 rounded-full blur-3xl"
        />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mobile-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#5EE6FE" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mobile-grid)"/>
          </svg>
        </div>

        {/* Floating paw prints */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0],
              y: [0, -15, 0]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              left: `${10 + (i * 20)}%`,
              top: `${10 + (i * 15)}%`,
            }}
          >
            <i className="fa-solid fa-paw text-4xl text-[#5EE6FE] opacity-10"></i>
          </motion.div>
        ))}
      </div>

      {/* Mobile Logo */}
      <img src="/images/logo.png" alt="Logo" className="block md:hidden fixed top-5 left-1/2 transform -translate-x-1/2 w-16 h-16 object-contain z-40" />

      {/* MOBILE-ONLY CONTENT - COMPLETELY REDESIGNED */}
      <div className="md:hidden relative z-20 min-h-screen flex flex-col">
        
        {/* Animated Header - Centered with reduced padding */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="pt-20 pb-2 px-6 text-center"
        >
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-800"
            style={{ fontFamily: "'Baloo Chettan 2', cursive" }}
          >
            Welcome
          </motion.h1>
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-xs mt-0.5"
          >
            Login to your account to continue
          </motion.p>
        </motion.div>

        {/* Static Cat Image - Adjusted position with less overlap */}
        <div className="flex justify-center -mb-6 z-30">
          <img
            src="/images/cat_peeking.png"
            alt="Cat"
            className="w-24 h-24 object-contain drop-shadow-xl"
          />
        </div>

        {/* Login Form Card - Reduced padding */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex-1 px-5 pb-4"
        >
          <motion.div 
            variants={scaleIn}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/50"
            style={{
              boxShadow: '0 15px 30px -12px rgba(0,0,0,0.15)'
            }}
          >
            {/* Decorative top line - smaller */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#5EE6FE] rounded-full"></div>

            <form onSubmit={handleLogin} className="space-y-3 mt-1">
              <AnimatePresence mode="wait">
                {formMessage.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <FormMessage type={formMessage.type} message={formMessage.message} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input - Reduced padding */}
              <motion.div variants={fadeInUp} className="space-y-0.5">
                <label className="text-xs font-medium text-gray-600 ml-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#5EE6FE] rounded-lg opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center bg-[#EAEAEA] rounded-lg overflow-hidden border border-gray-200 group-focus-within:border-[#5EE6FE]">
                    <div className="pl-3 pr-1.5">
                      <i className="fa-regular fa-envelope text-gray-500 text-sm"></i>
                    </div>
                    <input
                      type="email"
                      autoComplete="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="abcd@xyz.com"
                      className="flex-1 py-2.5 pr-3 outline-none bg-transparent text-gray-700 text-sm placeholder-gray-400"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Password Input - Reduced padding */}
              <motion.div variants={fadeInUp} className="space-y-0.5">
                <label className="text-xs font-medium text-gray-600 ml-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#5EE6FE] rounded-lg opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center bg-[#EAEAEA] rounded-lg overflow-hidden border border-gray-200 group-focus-within:border-[#5EE6FE]">
                    <div className="pl-3 pr-1.5">
                      <i className="fa-solid fa-lock text-gray-500 text-sm"></i>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Password"
                      className="flex-1 py-2.5 pr-2 outline-none bg-transparent text-gray-700 text-sm placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2 text-gray-500 hover:text-[#5EE6FE] transition-colors"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Forgot Password */}
              <motion.div variants={fadeInUp} className="flex justify-end mt-0.5">
                <button
                  type="button"
                  onClick={openForgot}
                  className="text-xs text-[#4E4E4E] hover:underline"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Login Button - Reduced padding */}
              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#5EE6FE] text-white font-semibold py-2.5 rounded-lg hover:bg-[#388A98] transition-colors text-sm"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>

              {/* Divider - Reduced spacing */}
              <motion.div variants={fadeInUp} className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </motion.div>

              {/* How to Create an Account Button - Reduced padding */}
              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowCreateAccountModal(true)}
                className="w-full bg-white border border-gray-300 rounded-lg py-2.5 text-gray-700 font-medium hover:border-[#5EE6FE] hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <i className="fa-solid fa-user-plus text-[#5EE6FE] text-sm"></i>
                <span>How to create an account</span>
              </motion.button>

              {/* Guest Link - Reduced margin */}
              <motion.div variants={fadeInUp} className="text-center mt-2">
                <Link 
                  to="/home" 
                  className="inline-block text-xs text-gray-500 hover:underline"
                >
                  Continue as a guest.
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* DESKTOP LOGIN FORM - KEPT EXACTLY THE SAME */}
      <div className="hidden md:block relative z-20 w-full md:w-auto min-h-screen flex flex-col items-center justify-center md:absolute md:top-1/2 md:right-8 lg:right-24 md:-translate-y-1/2 overflow-hidden">
        
        {/* Desktop top section - KEPT EXACTLY THE SAME */}
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

          {/* Cat image - KEPT EXACTLY THE SAME */}
          <div className="hidden sm:flex justify-center w-full z-40 pointer-events-none">
            <img
              src="/images/cat_peeking.png"
              alt="Cat"
              className="w-[80px] -mb-1 sm:-mb-2 md:-mb-4 sm:w-[100px] md:w-[120px] lg:w-[140px] object-contain drop-shadow-lg"
            />
          </div>

          {/* Desktop login form - KEPT EXACTLY THE SAME */}
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
              {/* Decorative inner shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5EE6FE] opacity-5 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2FA394] opacity-5 rounded-tr-full"></div>
              
              {/* Small decorative lines */}
              <div className="absolute top-10 left-10 w-16 h-16 border-2 border-[#5EE6FE] opacity-10 rounded-full"></div>
              <div className="absolute bottom-16 right-8 w-12 h-12 border border-[#42C4D6] opacity-10 rotate-45"></div>
              
              {/* Welcome text */}
              <div className="w-full flex items-center mb-2 px-2 sm:px-0 sm:py-2 md:py-3 relative z-10">
                <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
                <h1 className="mx-3 sm:mx-6 text-[20px] sm:text-[20px] md:text-[25px] font-bold text-gray-800" style={{ fontFamily: "'Baloo Chettan 2'" }}>
                  Welcome
                </h1>
                <div className="flex-1 h-[3px] bg-[#5EE6FE]" />
              </div> 

              <div className="text-gray-600 text-center mb-6 text-sm sm:text-base relative z-10">
                Login to your account to continue
              </div>       

              <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4 w-full px-4 sm:px-6 relative z-10">
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
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Password"
                      className="flex-1 py-2 sm:py-3 pr-3 outline-none bg-[#EAEAEA] text-[#404A4C] text-sm sm:text-base"
                    />

                  <button
                    type="button"
                    className="px-3 text-[#626262] hover:text-[#5EE6FE] focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
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

              {/* Divider and How to Create Account */}
              <div className="w-full px-4 sm:px-6 relative z-10">
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

              <Link to="/home" className="text-xs sm:text-sm text-gray-500 mt-4 hover:underline inline-block relative z-10">
                Continue as a guest.
              </Link>
            </div>
          </div>
      </div>

      {/* MODALS - Enhanced for mobile only, kept desktop styles */}
      <AnimatePresence>
        {/* Forgot Password Modal */}
        {emailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm md:backdrop-blur-none" 
              onClick={() => setEmailModalOpen(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden md:rounded-2xl">
                <div className="h-2 bg-[#5EE6FE] md:h-1"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#5EE6FE] rounded-2xl flex items-center justify-center md:w-10 md:h-10 md:rounded-lg">
                      <i className="fa-regular fa-envelope text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                      <p className="text-sm text-gray-500">We'll send you a reset link</p>
                    </div>
                  </div>

                  <form onSubmit={submitEmail} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {emailMessage.message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <FormMessage type={emailMessage.type} message={emailMessage.message} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <input
                        type="email"
                        required
                        autoFocus
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5EE6FE] focus:ring-2 focus:ring-[#5EE6FE]/20 outline-none transition-all"
                      />
                      <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        onClick={() => setEmailModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!fpEmail || sending}
                        className="flex-1 px-4 py-3 bg-[#5EE6FE] text-white rounded-xl font-semibold hover:bg-[#388A98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {sending ? "Sending..." : "Send Link"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm md:backdrop-blur-none" 
              onClick={() => setShowSuccessModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden text-center md:rounded-2xl">
                <div className="h-2 bg-green-500 md:h-1"></div>
                <div className="p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center"
                  >
                    <i className="fa-regular fa-envelope-check text-3xl text-green-600"></i>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email!</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    We've sent a password reset link to your email address.
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-8 py-3 bg-[#5EE6FE] text-white rounded-xl font-semibold hover:bg-[#388A98] transition-all"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Account Modal */}
        {showCreateAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm md:backdrop-blur-none" 
              onClick={() => setShowCreateAccountModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden md:rounded-2xl">
                <div className="h-2 bg-[#5EE6FE] md:h-1"></div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-[#5EE6FE] rounded-2xl flex items-center justify-center md:w-12 md:h-12 md:rounded-xl">
                      <i className="fa-regular fa-user-plus text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Account Creation</h3>
                      <p className="text-sm text-gray-500">Requirements for online access</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <i className="fa-regular fa-circle-info text-blue-500 text-lg mt-0.5"></i>
                      <div>
                        <p className="text-blue-800 font-medium text-sm">To create an online account, you must:</p>
                        <p className="text-blue-700 text-sm mt-1">Have at least one completed service with us</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { icon: 'fa-calendar-check', title: 'Visit Our Clinic', desc: 'Book and complete any veterinary service', color: 'bg-emerald-500' },
                      { icon: 'fa-hand', title: 'Request Online Access', desc: 'Ask our staff to activate your online account', color: 'bg-blue-500' },
                      { icon: 'fa-key', title: 'Receive Credentials', desc: 'Get your login details after service completion', color: 'bg-purple-500' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <i className={`fa-regular ${item.icon} text-white text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateAccountModal(false)}
                      className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateAccountModal(false);
                        navigate('/home');
                      }}
                      className="flex-1 bg-[#5EE6FE] text-white py-3 rounded-xl hover:bg-[#388A98] transition-all font-medium text-sm"
                    >
                      View Services
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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