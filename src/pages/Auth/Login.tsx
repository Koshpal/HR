import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-[var(--color-bg-secondary)]">
      <div className="relative w-full max-w-md p-8 shadow-2xl rounded-[2.5rem] sm:p-10 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-xl font-bold sm:text-2xl text-[var(--color-text-primary)] font-heading tracking-tight">
            Koshpal
          </span>
        </div>

        <div className="mb-10 text-left">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl text-[var(--color-text-primary)] font-heading tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-medium">
            Sign in to your organization's wellness dashboard
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm rounded-2xl bg-[var(--color-error)]/5 border border-[var(--color-error)]/10 text-[var(--color-error)] flex items-center gap-3 font-medium animate-in fade-in zoom-in-95">
            <AlertCircle className="flex-shrink-0 w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field — manual markup so the eye toggle sits inside the input's own relative container */}
          <div className="w-full space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl pl-11 pr-11 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <label className="flex items-center flex-shrink-0 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-pointer transition-all"
              />
              <span className="ml-2 text-sm text-[var(--color-text-secondary)] font-medium group-hover:text-[var(--color-text-primary)] transition-colors">
                Remember me
              </span>
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-bold py-4 text-base rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white shadow-xl shadow-[var(--color-primary)]/20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:scale-[1.02] active:scale-[0.98] mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
