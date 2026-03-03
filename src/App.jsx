import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Activity, List, BarChart2, Pill, Settings } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import LoginPage   from '@/pages/LoginPage';
import Dashboard   from '../pages/Dashboard';
import Readings    from '../pages/Readings';
import Charts      from '../pages/Charts';
import Medications from '../pages/Medications';
import SettingsPage from '../pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
});

const TABS = [
  { id: 'dashboard',   label: 'Home',      Icon: Activity,  Component: Dashboard },
  { id: 'readings',    label: 'Readings',  Icon: List,      Component: Readings },
  { id: 'charts',      label: 'Charts',    Icon: BarChart2, Component: Charts },
  { id: 'medications', label: 'Meds',      Icon: Pill,      Component: Medications },
  { id: 'settings',    label: 'Settings',  Icon: Settings,  Component: SettingsPage },
];

function AuthenticatedApp({ logout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { Component } = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Component onLogout={logout} />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                activeTab === id ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${activeTab === id ? 'scale-110' : ''}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function AppInner() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return <AuthenticatedApp logout={logout} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
