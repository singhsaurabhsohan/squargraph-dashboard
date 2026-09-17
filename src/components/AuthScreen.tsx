import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthProviderType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthScreenProps {
  onLoginSuccess: (user?: unknown) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const requireSupabase = () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Authentication is not configured for this deployment. Add the production Supabase URL and publishable key.');
      return null;
    }
    return supabase;
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    const client = requireSupabase();
    if (!client) return;
    setError('');
    setMessage('');
    setLoadingProvider(provider);
    const { error: authError } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (authError) {
      setLoadingProvider(null);
      setError(authError.message);
    }
  };

  const handleSquargraphLogin = async () => {
    if (!email) {
      setError('Enter your SQUARGRAPH work email first.');
      return;
    }
    const client = requireSupabase();
    if (!client) return;
    setError('');
    setMessage('');
    setLoadingProvider('squargraph');
    const { data, error: authError } = await client.auth.signInWithPassword({ email, password });
    setLoadingProvider(null);
    if (authError) {
      setError(authError.message);
      return;
    }
    onLoginSuccess(data.user);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = requireSupabase();
    if (!client) return;
    setError('');
    setMessage('');
    setLoadingProvider('email');

    if (mode === 'signup') {
      const { data, error: authError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      setLoadingProvider(null);
      if (authError) {
        setError(authError.message);
        return;
      }
      if (data.session) {
        onLoginSuccess(data.user);
      } else {
        setMessage('Account created. Check your work email to confirm your account, then sign in.');
        setMode('signin');
      }
      return;
    }

    const { data, error: authError } = await client.auth.signInWithPassword({ email, password });
    setLoadingProvider(null);
    if (authError) {
      setError(authError.message);
      return;
    }
    onLoginSuccess(data.user);
  };

  const handleSignOutSafe = () => {
    void supabase?.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#0d0f0c] text-neutral-200 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8ff75]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="text-center mb-8 z-10">
        <a href="#welcome" className="inline-block text-3xl font-black tracking-tight text-white">
          SQUARGRAPH<span className="text-[#e8ff75] text-xs align-top">™</span>
        </a>
        <p className="text-[11px] font-mono tracking-widest uppercase text-[#e8ff75] font-bold mt-1">
          SITE CONTROL & DEVELOPMENT PLATFORM
        </p>
      </div>

      <div className="w-full max-w-md bg-[#131611] border border-[#262c20] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#232720]">
          <div>
            <h2 className="text-lg font-black text-white">
              {mode === 'signin' ? 'Sign in to Site Control' : 'Create Client Workspace'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {mode === 'signin' ? 'Internal studio team & subscription clients' : 'Create a secure client account'}
            </p>
          </div>
          <div className="flex bg-[#0e100c] p-1 rounded-lg border border-[#232720] text-xs">
            <button type="button" onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className={`px-3 py-1 rounded font-semibold ${mode === 'signin' ? 'bg-[#e8ff75] text-black' : 'text-neutral-400'}`}>Sign In</button>
            <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className={`px-3 py-1 rounded font-semibold ${mode === 'signup' ? 'bg-[#e8ff75] text-black' : 'text-neutral-400'}`}>Register</button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2.5 text-xs text-red-200 flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-xl border border-[#344122] bg-[#1d2515] px-3 py-2.5 text-xs text-[#e8ff75]">
            {message}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button type="button" onClick={handleSquargraphLogin} disabled={!!loadingProvider} className="w-full py-2.5 px-4 rounded-xl bg-[#1d2217] hover:bg-[#262e1e] border border-[#323d27] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm">
            {loadingProvider === 'squargraph' ? <span className="w-4 h-4 border-2 border-[#e8ff75] border-t-transparent rounded-full animate-spin" /> : <span className="w-5 h-5 rounded bg-[#e8ff75] text-black flex items-center justify-center text-[10px] font-black">S</span>}
            Sign in with SQUARGRAPH Team Account
          </button>
          <button type="button" onClick={() => void handleOAuthLogin('google')} disabled={!!loadingProvider} className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm">
            {loadingProvider === 'google' ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <span className="font-bold text-sm">G</span>}
            Continue with Google Workspace
          </button>
          <button type="button" onClick={() => void handleOAuthLogin('apple')} disabled={!!loadingProvider} className="w-full py-2.5 px-4 rounded-xl bg-[#080907] hover:bg-[#121410] border border-[#2b3323] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm">
            {loadingProvider === 'apple' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-base"></span>}
            Continue with Apple ID
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#232720]" /></div>
          <span className="relative bg-[#131611] px-3 text-[11px] uppercase tracking-wider text-neutral-500 font-mono">Or with corporate email</span>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Your Full Name</label>
                <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Company / Organization</label>
                <input type="text" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} required className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Work Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Password</label>
            <input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} className="w-full bg-[#0d0f0c] border border-[#262c20] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#e8ff75] outline-none transition-colors" />
          </div>
          <button type="submit" disabled={!!loadingProvider} className="w-full py-3 rounded-xl font-bold text-xs text-black bg-[#e8ff75] hover:bg-[#dcfa5a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all mt-4">
            {loadingProvider === 'email' ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Secure Account'}<ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1f231b] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1 text-lime-400/80"><ShieldCheck size={13} /> Supabase Auth</span>
          <span>SQUARGRAPH v2.4</span>
        </div>
      </div>
    </div>
  );
};
