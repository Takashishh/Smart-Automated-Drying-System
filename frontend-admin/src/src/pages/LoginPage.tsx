import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CloudRain, Mail, Eye, EyeOff, Lock } from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 5;
const COOLDOWN_DURATION = 300; // 5 minutes in seconds
const REMEMBER_EMAIL_KEY = 'login_remember_email';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load failed attempts and cooldown from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('login_attempts');
    const cooldownEnd = localStorage.getItem('login_cooldown_end');
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (stored) {
      const attempts = JSON.parse(stored);
      setFailedAttempts(attempts);
    }

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    if (cooldownEnd) {
      const endTime = parseInt(cooldownEnd);
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

  // Countdown timer
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
    setError('');

    if (isLocked) {
      setError(`Account is locked. Please try again in ${cooldownTime} seconds.`);
      return;
    }

    setIsLoading(true);

    try {
      const adminData = await login(email, password);
      console.log(adminData);
      
      // Reset on successful login
      setFailedAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_cooldown_end');

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      // If account is disabled, show a clear message and don't count it as a failed attempt
      const msg = err?.message || 'Couldn\'t sign in. Please check your credentials.';
      if (typeof msg === 'string' && msg.toLowerCase().includes('disabled')) {
        setError('Your account has been disabled. Please contact a Super-Admin to re-activate your account.');
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('login_attempts', JSON.stringify(newAttempts));

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          // Lock account for 5 minutes
          const cooldownEndTime = Date.now() + COOLDOWN_DURATION * 1000;
          localStorage.setItem('login_cooldown_end', cooldownEndTime.toString());
          setIsLocked(true);
          setCooldownTime(COOLDOWN_DURATION);
          setError(`Too many failed login attempts. Account locked for 5 minutes.`);
        } else {
          const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
          setError(
            `${msg}. ${remainingAttempts} attempt${
              remainingAttempts !== 1 ? 's' : ''
            } remaining.`
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in-down">
          <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <img src="/Iconi.png" alt="WeatherSmart Logo" className="h-full w-full object-cover" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 animate-fade-in">
          WeatherSmart Rack
        </h2>
        <p className="mt-3 text-center text-base text-gray-600 font-medium animate-fade-in">
          Admin & Super-Admin Portal
        </p>
        <p className="mt-1 text-center text-sm text-gray-500 animate-fade-in">
          Unified login for all administrators
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-lg py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-12 border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@weathersmart.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-black"
                  style={{ caretColor: '#000000' }}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-black"
                  style={{ caretColor: '#000000' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-2 animate-shake">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl" 
                isLoading={isLoading}
                disabled={isLocked || isLoading}
              >
                {isLocked 
                  ? `Locked (${cooldownTime}s)` 
                  : isLoading 
                  ? 'Signing in...' 
                  : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure administrator access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
