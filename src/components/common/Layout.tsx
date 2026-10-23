import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const TITLES: Array<[string, string]> = [
  ['/employees', 'Employee Directory'],
  ['/sessions', 'Sessions'],
  ['/reports', 'Reports'],
  ['/settings', 'Settings'],
];

const titleFor = (pathname: string) =>
  TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Dashboard';

/**
 * Figma frame: white canvas, 24px gutters, 256px sidebar, 24px gap, content column.
 * The header card is 76px tall; pages add their own section gap below it
 * (16px on the table pages, 32px on the dashboard).
 */
export const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('hr_sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hr_sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex min-h-screen flex-col p-4 transition-[padding] duration-300 ease-in-out lg:p-6 ${
          isSidebarCollapsed ? 'lg:pl-[90px]' : 'lg:pl-[304px]'
        }`}
      >
        <Header title={titleFor(location.pathname)} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="mt-4 flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
