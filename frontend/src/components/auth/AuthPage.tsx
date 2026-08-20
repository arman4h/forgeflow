import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, MailCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../lib/auth-client';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      fill="currentColor"
    />
  </svg>
);

function EmailVerificationScreen({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Check your email
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              We sent a verification link to
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {email}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Click the link in the email to verify your account and sign in.
            The link expires in 24 hours.
          </p>

          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Didn't receive it? Check your spam folder or try signing up again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthPageProps {
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmail(email, password);
        if (result.session) {
          window.location.reload();
        } else {
          setVerifyEmail(email);
        }
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        const result = await signUpWithEmail(name, email, password);
        if (result.user?.identities?.length === 0) {
          setError('An account with this email already exists.');
          setLoading(false);
          return;
        }
        if (!result.session) {
          setVerifyEmail(email);
          return;
        }
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  if (verifyEmail) {
    return <EmailVerificationScreen email={verifyEmail} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        {onBack && (
          <button onClick={onBack} className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
            &larr; Back to home
          </button>
        )}
        {/* Branding */}
        <div className="flex flex-col items-center gap-3">
          <img src="/Trackflow_logo.svg" alt="TaskFlow" className="w-10 h-10 rounded-xl shadow-lg" />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Welcome to TaskFlow
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLogin
                ? 'Sign in to your account'
                : 'Create your account to get started'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Arman Khan"
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full h-9 pl-9 pr-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-400 dark:text-zinc-500">
              Or
            </span>
          </div>
        </div>

        {/* Google Sign-In */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </Button>

        {/* Toggle login/signup */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Terms */}
        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
