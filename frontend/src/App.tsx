import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { ProfileSetupForm } from './components/auth/ProfileSetupForm';
import { LandingPage } from './components/landing/LandingPage';
import { supabase } from './config/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Route = 'landing' | 'auth' | 'app';

function AppContent() {
  const { currentUser, isAuthenticated, isLoading } = useApp();
  const [route, setRoute] = useState<Route>('landing');

  // Detect invite links on mount: if URL has ?invite= or /join/ → go to auth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasInvite = params.has('invite') || window.location.pathname.startsWith('/join/');
    if (hasInvite && !isAuthenticated) {
      setRoute('auth');
    }
  }, [isAuthenticated]);

  // Sync route with auth state
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      setRoute('app');
    } else if (route === 'app') {
      setRoute('landing');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm animate-pulse">
          T
        </div>
      </div>
    );
  }

  if (route === 'auth' || (!isAuthenticated && route !== 'landing')) {
    return <AuthPage onBack={() => setRoute('landing')} />;
  }

  if (!isAuthenticated) {
    return <LandingPage onNavigateToAuth={() => setRoute('auth')} />;
  }

  if (currentUser && currentUser.profileCompleted === false) {
    return <ProfileSetupForm />;
  }

  return <AppLayout />;
}

function OAuthHandler({ children }: { children: React.ReactNode }) {
  const [exchanging, setExchanging] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      setExchanging(true);
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.history.replaceState({}, '', '/');
      }).catch(() => {
        window.history.replaceState({}, '', '/');
      }).finally(() => {
        setExchanging(false);
      });
    }
  }, []);

  if (exchanging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm animate-pulse">
            T
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Completing sign-in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OAuthHandler>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </OAuthHandler>
    </QueryClientProvider>
  );
}
