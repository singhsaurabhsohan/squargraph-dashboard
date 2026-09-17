import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthScreen } from './components/AuthScreen';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './index.css';
import './styles/control-platform.css';

function AuthGate() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthenticated(Boolean(data.session?.user));
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthenticated(Boolean(session?.user));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured || !supabase) {
    return <AuthScreen onLoginSuccess={() => undefined} />;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0d0f0c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-[#e8ff75] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-neutral-400 font-mono tracking-wider">CHECKING SECURE SESSION</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthScreen onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
);
