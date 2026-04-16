import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './NavigationSidebar';
import { Navbar } from './Navbar';
import { AssistantWidget } from '../../../features/assistant/components/AssistantWidget';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
      
      {/* Global widget mounted outside the main flow */}
      <AssistantWidget />
    </div>
  );
}