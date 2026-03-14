
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider, useData } from './src/context/DataContext';
import { Sidebar } from './src/components/Sidebar';
import { Header } from './src/components/Header';
import LoginView from './src/views/LoginView';

// Views
import DashboardView from './views/DashboardView';
import CRMView from './views/CRMView';
import FunnelView from './views/FunnelView';
import ServicesView from './views/ServicesView';
import InvoicesView from './views/InvoicesView';
import SettingsView from './views/SettingsView';
import FiscalView from './src/views/FiscalView';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { loading: dataLoading } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'funnel' | 'services' | 'invoices' | 'settings' | 'fiscal'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('pipeday_theme');
    return saved === 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Theme
  React.useEffect(() => {
    localStorage.setItem('pipeday_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Render Content based on active tab
  // Note: Views will now consume data from Context directly or we need to pass it? 
  // For the first step of refactor, we are going to update Views to use Context directly.
  // EXCEPT DashboardView might still need some props if we don't update it yet.
  // To avoid breaking, we will update views to be compatible.

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    const commonProps = { isDarkMode };
    switch (activeTab) {
      case 'dashboard': return <DashboardView {...commonProps} searchQuery={searchQuery} setActiveTab={handleTabChange} />;
      case 'crm': return <CRMView {...commonProps} searchQuery={searchQuery} />;
      case 'funnel': return <FunnelView {...commonProps} searchQuery={searchQuery} />;
      case 'services': return <ServicesView {...commonProps} searchQuery={searchQuery} />;
      case 'invoices': return <InvoicesView {...commonProps} searchQuery={searchQuery} />;
      case 'settings': return <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'fiscal': return <FiscalView isDarkMode={isDarkMode} />;
      default: return <DashboardView {...commonProps} setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userEmail={user.email}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={signOut}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {dataLoading && activeTab !== 'settings' && (
            <div className="absolute top-0 right-0 p-4 z-10">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;