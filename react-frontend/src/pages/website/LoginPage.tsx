import React, { useEffect, useState } from 'react';
import { LogIn, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLoggedIn?: (token: string, user?: any) => void;
}

export function LoginPage({ onLoggedIn }: LoginPageProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const MAX_LOGIN_ATTEMPTS = 5;
  const COOLDOWN_DURATION = 300; // 5 minutes in seconds
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const stored = localStorage.getItem('login_attempts');
    const cooldownEnd = localStorage.getItem('login_cooldown_end');
    const rememberedEmail = localStorage.getItem('remember_user');

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    if (stored) {
      const attempts = JSON.parse(stored);
      setFailedAttempts(attempts);
    }

    if (cooldownEnd) {
      const endTime = parseInt(cooldownEnd, 10);
      const now = Date.now();
      if (now < endTime) {
        setIsLocked(true);
        setCooldownTime(Math.ceil((endTime - now) / 1000));
      } else {
        localStorage.removeItem('login_cooldown_end');
        localStorage.removeItem('login_attempts');
      }
    }
  }, []);

  useEffect(() => {
    if (!isLocked || cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setIsLocked(false);
          setFailedAttempts(0);
          localStorage.removeItem('login_attempts');
          localStorage.removeItem('login_cooldown_end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (isLocked) {
      setStatus('error');
      setErrorMessage(`Account is locked. Please try again in ${cooldownTime} seconds.`);
      return;
    }
    setStatus('submitting');
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      


      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const data = await res.json();
      localStorage.setItem('auth_token', data.token);
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      setFailedAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_cooldown_end');
      if (rememberMe) {
        localStorage.setItem('remember_user', email);
      } else {
        localStorage.removeItem('remember_user');
      }
      setStatus('success');
      setTimeout(() => {
        onLoggedIn?.(data.token, data.user);
      }, 1000);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('login_attempts', JSON.stringify(newAttempts));

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const cooldownEndTime = Date.now() + COOLDOWN_DURATION * 1000;
        localStorage.setItem('login_cooldown_end', cooldownEndTime.toString());
        setIsLocked(true);
        setCooldownTime(COOLDOWN_DURATION);
        setStatus('error');
        setErrorMessage('Too many failed login attempts. Account locked for 5 minutes.');
      } else {
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
        setStatus('error');
        setErrorMessage(
          `${err instanceof Error ? err.message : 'Couldn\'t sign in'}. ${remainingAttempts} attempt${
            remainingAttempts !== 1 ? 's' : ''
          } remaining.`
        );
      }
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"
        />
      </div>

      <div className="relative pt-24 pb-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg overflow-hidden"
              >
                <img src="/Iconi.png" alt="Smart Laundry Logo" className="w-full h-full object-cover" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your Smart Laundry account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting' || status === 'success' || isLocked}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg ${
                  status === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-200'
                    : status === 'submitting' || isLocked
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200 hover:shadow-xl'
                }`}
              >
                {status === 'submitting' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                    />
                    <span>Signing In...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Success!</span>
                  </>
                ) : isLocked ? (
                  <>
                    <span>Locked ({cooldownTime}s)</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>

              {/* Error Message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={18} />
                      {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Security Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500 mt-6"
          >
            🔒 Your connection is secure and encrypted
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
