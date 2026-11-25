import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HrService } from '../../services/hr.service';
import type { HrProfile } from '../../types/auth.types';
import { figma } from '../../assets/figma';
import { FigmaIcon } from './FigmaIcon';
import { Avatar } from './Avatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

type Item = {
  icon: string;
  label: string;
  path: string;
  match: (p: string) => boolean;
  onClick?: () => void;
};

const mainItems: Item[] = [
  {
    icon: figma.chartPie,
    label: 'Dashboard',
    path: '/dashboard',
    match: (p) => p === '/dashboard' || p === '/',
  },
  {
    icon: figma.addressBook,
    label: 'Employee Directory',
    path: '/employees',
    match: (p) => p.startsWith('/employees'),
  },
  {
    icon: figma.presentationUser,
    label: 'Sessions',
    path: '/sessions',
    match: (p) => p.startsWith('/sessions'),
  },
  {
    icon: figma.impact,
    label: 'Impact',
    path: '/impact',
    match: (p) => p.startsWith('/impact'),
  },
  {
    // iconTrendUpCircle is a white glyph made for a coloured tile; on this white tile it was invisible.
    icon: figma.coaching,
    label: 'Coaching',
    path: '/coaching',
    match: (p) => p.startsWith('/coaching'),
  },
];

/**
 * Figma "Sidebar coach / Open": 256px column, 42px rows (p-4, r16) with a bordered
 * 36px icon tile, Outfit labels (16/28 main, 14/24 actions), "Actions" group and the
 * user tile pinned to the bottom.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [actionsOpen, setActionsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<HrProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = profile?.fullName || user?.name || user?.email?.split('@')[0] || 'HR Manager';
  const userPhoto = profile?.profilePhoto || user?.profilePhoto || undefined;
  const userRole = profile?.designation || 'HR Manager';
  // Refetch after visiting Settings, where the profile can change
  const refreshKey = location.pathname === '/settings' ? location.key : '';

  // Name, photo and designation come from the HR profile (kept fresh when Settings updates it)
  useEffect(() => {
    let ignore = false;
    HrService.getHrProfile()
      .then((p) => { if (!ignore) setProfile(p); })
      .catch(() => { /* fall back to the login payload */ });
    return () => { ignore = true; };
  }, [user?.id, refreshKey]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  const actionItems: Item[] = [
    {
      icon: figma.settingsNav,
      label: 'Settings',
      path: '/settings',
      match: (p) => p === '/settings',
    },
    {
      icon: figma.chatInfo,
      label: 'Help & Support',
      path: '',
      match: () => false,
      onClick: () => {
        window.location.assign('mailto:koshpal@koshpal.com?subject=Koshpal%20HR%20portal%20support');
      },
    },
  ];

  const renderRow = (item: Item, small?: boolean) => {
    const active = item.match(location.pathname);
    return (
      <button
        key={item.label}
        type="button"
        title={isCollapsed ? item.label : undefined}
        onClick={() => (item.onClick ? item.onClick() : go(item.path))}
        className={`flex h-[42px] w-full items-center gap-2 rounded-[16px] p-1 transition-colors ${
          isCollapsed ? 'lg:justify-center' : ''
        } ${active ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
      >
        <span className="flex aspect-square h-full shrink-0 items-center justify-center rounded-[12px] border border-solid border-neutral-50 bg-white">
          <FigmaIcon src={item.icon} size={16} />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-left font-outfit font-normal text-neutral-950 ${
            small ? 'text-[14px] leading-6' : 'text-[16px] leading-7'
          } ${isCollapsed ? 'lg:hidden' : ''}`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] -translate-x-full flex-col justify-between bg-white p-6 shadow-xl transition-all duration-300 ease-in-out lg:bottom-6 lg:left-6 lg:top-6 lg:h-auto lg:translate-x-0 lg:p-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : ''
        } ${isCollapsed ? 'lg:w-[42px]' : 'lg:w-[256px]'}`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo & Close panel */}
          <div className={`flex items-center justify-between ${isCollapsed ? 'lg:flex-col lg:gap-4' : ''}`}>
            <div className={`relative h-[28px] w-[111px] shrink-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <div className="absolute inset-[-97.5%_-26.85%_-109.64%_-25.41%]">
                <img src={figma.logo} alt="Koshpal" className="block size-full max-w-none" draggable={false} />
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 items-center justify-center rounded-[8px] border border-solid border-neutral-100 px-2.5 lg:hidden"
              aria-label="Close menu"
            >
              <X className="size-5 text-neutral-700" />
            </button>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden h-10 shrink-0 items-center justify-center rounded-[8px] border border-solid border-neutral-100 px-2.5 lg:flex"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <FigmaIcon src={figma.anglesLeft} size={20} className={isCollapsed ? 'rotate-180' : ''} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-2">{mainItems.map((item) => renderRow(item))}</nav>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActionsOpen((o) => !o)}
                className={`flex items-center justify-between pr-1 ${isCollapsed ? 'lg:hidden' : ''}`}
              >
                <span className="flex-1 text-left font-outfit text-[14px] font-normal leading-6 text-neutral-500">
                  Actions
                </span>
                <span className="flex items-center px-2">
                  <FigmaIcon src={figma.angleUpSmall} size={24} className={actionsOpen ? '' : 'rotate-180'} />
                </span>
              </button>
              {(actionsOpen || isCollapsed) && (
                <div className="flex flex-col gap-2">{actionItems.map((item) => renderRow(item, true))}</div>
              )}
            </div>
          </div>
        </div>

        {/* User */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex w-full items-center gap-4 text-left ${isCollapsed ? 'lg:justify-center' : ''}`}
            aria-label="Account menu"
          >
            <div className="relative size-10 shrink-0">
              <Avatar name={userName} photo={userPhoto} />
              <span className="absolute left-[80%] top-[-2.5%] size-[25%] rounded-full bg-primary-600" />
            </div>
            <div className={`flex min-w-0 flex-col justify-center ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate font-geist text-[16px] font-medium leading-7 text-neutral-800">{userName}</p>
              <p className="font-outfit text-[10px] font-normal leading-[18px] text-neutral-400">{userRole}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-60 overflow-hidden rounded-[12px] border border-solid border-neutral-100 bg-white py-1 shadow-medium">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  go('/settings');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 font-outfit text-[14px] leading-6 text-neutral-800 hover:bg-neutral-50"
              >
                <SettingsIcon className="size-4 text-neutral-500" />
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 font-outfit text-[14px] leading-6 text-error-600 hover:bg-neutral-50"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
