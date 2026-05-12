import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  X,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: FileText, label: 'Sessions', path: '/sessions' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-500 ease-in-out bg-[var(--color-bg-card)] border-r border-[var(--color-border-primary)] ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} lg:translate-x-0 w-72 shadow-xl shadow-black/5`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 border-b border-[var(--color-border-primary)] h-[89px]">
            {!isCollapsed && (
              <div className="flex items-center gap-3 transition-opacity duration-500">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/logo.png" alt="Koshpal" />
                </div>
                <span className="text-xl font-bold text-[var(--color-text-primary)] font-heading tracking-tight">
                  Koshpal <span className="text-[var(--color-primary)]">HR</span>
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-all"
                aria-label="Toggle sidebar"
              >
                <ChevronLeft
                  className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-8">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`group w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all duration-300 relative rounded-2xl ${isCollapsed ? 'justify-center' : ''
                        } ${active
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {!isCollapsed && (
                        <span className="flex-1 text-left transition-all duration-300">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* <div className="p-6 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/30">
            <button
              onClick={handleLogout}
              className={`group w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/5 rounded-2xl transition-all duration-300 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
              {!isCollapsed && <span>Logout</span>}
            </button> 
          </div> */}
        </div>
      </aside>
    </>
  );
};
