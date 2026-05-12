import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

import { Button } from '../ui/Button';

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || user?.email?.split('@')[0] || 'HR Manager';
  const userEmail = user?.email || '';

  const getInitials = (name: string) => {
    if (!name) return 'H';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b lg:px-6 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] h-[89px] relative z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {title && (
          <h1 className="text-xl font-bold lg:text-2xl text-[var(--color-text-primary)] font-heading">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 transition-transform rounded-2xl hover:scale-105 bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
          >
            <span className="text-sm font-bold">{getInitials(userName)}</span>
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-72 rounded-[2rem] overflow-hidden transition-all duration-200 bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] shadow-2xl animate-in fade-in zoom-in-95"
            >
              <div className="px-6 py-6 flex items-center gap-4 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/30">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold bg-[var(--color-primary)] text-white text-lg shadow-md shadow-[var(--color-primary)]/20">
                  {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-[15px]">{userName}</p>
                  <p className="text-xs truncate text-[var(--color-text-secondary)] font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)] rounded-2xl transition-all"
                >
                  <Settings className="w-5 h-5 opacity-70" />
                  <span className="flex-1 text-left">Settings</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)] rounded-2xl transition-all"
                >
                  <HelpCircle className="w-5 h-5 opacity-70" />
                  <span className="flex-1 text-left">Help</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <div className="h-[1px] my-2 mx-4 bg-[var(--color-border-primary)]"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/5 rounded-2xl transition-all"
                >
                  <LogOut className="w-5 h-5 opacity-70" />
                  <span className="flex-1 text-left">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
