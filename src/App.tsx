import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { currentUser, isAuthenticated, isLoading } = useApp();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm animate-pulse">
          F
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}
