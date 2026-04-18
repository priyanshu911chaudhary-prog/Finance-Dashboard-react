import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBootLoader } from '../ui/Loader';
import { Sidebar } from './NavigationSidebar';
import { Navbar } from './Navbar';
import { AssistantWidget } from '../../../features/assistant/components/AssistantWidget';
import { useLocation } from 'react-router-dom';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Pass isSidebarOpen as prop to children via context or prop drilling
  // Main screen loader (simulate initial load)
  const [appLoaded, setAppLoaded] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setAppLoaded(true), 700); // Simulate loading
    return () => clearTimeout(timeout);
  }, []);
  if (!appLoaded) {
    return <AppBootLoader />;
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative">
          {/* Only inject prop for TransactionsPage/Filters route */}
          {location.pathname.startsWith('/transactions') ? (
            <Outlet context={{ isSidebarOpen }} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <AssistantWidget />
    </div>
  );
}