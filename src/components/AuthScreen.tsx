import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building,
  User,
  Sparkles,
  Globe,
} from 'lucide-react';
import { UserAccount, AuthProviderType } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);

  const handleOAuthLogin = (provider: AuthProviderType) => {
    setLoadingProvider(provider);
    setTimeout(() => {
      const isInternal = provider === 'squargraph' || email.includes('@squargraph.com');
      const mockUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name:
          provider === 'squargraph'
            ? 'Saurabh Singh'
            : provider === 'google'
            ? 'Saurabh Singh (Google)'
            : 'Enterprise Client Admin',
        email:
          email ||
          (provider === 'squargraph'
            ? 'saurabh@squargraph.com'
            : provider === 'google'
            ? 'singhsaurabhsohan@gmail.com'
            : 'admin@client-company.com'),
        avatar: 'SS',
        provider,
        organization: isInternal ? 'SQUARGRAPH Studio' : company || 'Global Brand Enterprise',
        role: isInternal ? 'owner' : 'admin',
        plan: isInternal ? 'enterprise' : 'pro',
        seats: isInternal ? 25 : 5,
        apiKeysCount: 2,
        isInternalSquargraph: isInternal,
        twoFactorEnabled: true,
        createdAt: '2026-09-16',
      };
      setLoadingProvider(null);
      onLoginSuccess(mockUser);
    }, 700);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleOAuthLogin('email');
  };

  return (
    <div className="min-h-screen bg-[#0d0f0c] text-neutral-200 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8ff75]/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="text-center mb-8 z-10">
        <a href="#welcome" className="inline-block text-3xl font-black tracking-tight text-white">
          SQUARGRAPH<span className="text-[#e8ff75] text-xs align-top">™</span>
        </a>
        <p className="text-[11px] font-mono tracking-widest uppercase text-[#e8ff75] font-bold mt-1">
          SITE CONTROL & DEVELOPMENT PLATFORM
        </p>
      </div>

      {/* Main Auth Box */}
      <div className="w-full max-w-md bg-[#131611] border border-[#262c20] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#232720]">
          <div>
            <h2 className="text-lg font-black text-white">
              {mode === 'signin' ? 'Sign in to Site Control' : 'Create Client Workspace'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {mode === 'signin'
                ? 'Internal studio team & subscription clients'
                : 'Get started with a 14-day free trial on Pro'}
            </p>
          </div>

          <div className="flex bg-[#0e100c] p-1 rounded-lg border border-[#232720] text-xs">
            <button
              onClick={() => setMode('signin')}
              className={`px-3 py-1 rounded font-semibold ${
                mode === 'signin' ? 'bg-[#e8ff75] text-black' : 'text-neutral-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-3 py-1 rounded font-semibold ${
                mode === 'signup' ? 'bg-[#e8ff75] text-black' : 'text-neutral-400'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          {/* SQUARGRAPH SSO */}
          <button
            onClick={() => handleOAuthLogin('squargraph')}
            disabled={!!loadingProvider}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1d2217] hover:bg-[#262e1e] border border-[#323d27] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            {loadingProvider === 'squargraph' ? (
              <span className="w-4 h-4 border-2 border-[#e8ff75] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="w-5 h-5 rounded bg-[#e8ff75] text-black flex items-center justify-center text-[10px] font-black">
                S
              </span>
            )}
            Sign in with SQUARGRAPH Team SSO
          </button>

          {/* Google SSO */}
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={!!loadingProvider}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            {loadingProvider === 'google' ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Google Workspace
          </button>

          {/* Apple ID */}
          <button
            onClick={() => handleOAuthLogin('apple')}
            disabled={!!loadingProvider}
            className="w-full py-2.5 px-4 rounded-xl bg-[#080907] hover:bg-[#121410] border border-[#2b3323] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            {loadingProvider === 'apple' ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-base"></span>
            )}
            Continue with Apple ID
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#232720]" />
          </div>
          <span className="relative bg-[#131611] px-3 text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
            Or with corporate email
          </span>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Saurabh Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="Acme Global Corporation"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Work Email</label>
            <input
              type="email"
              placeholder="saurabh@squargraph.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs text-black bg-[#e8ff75] hover:bg-[#dcfa5a] flex items-center justify-center gap-2 transition-all mt-4"
          >
            {mode === 'signin' ? 'Sign In to Workspace' : 'Start 14-Day Pro Trial'}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-[#1f231b] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1 text-lime-400/80">
            <ShieldCheck size={13} /> AES-256 Auth Vault
          </span>
          <span>SQUARGRAPH v2.4</span>
        </div>
      </div>
    </div>
  );
};
