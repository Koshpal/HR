import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { figma } from '../../assets/figma';
import { FigmaIcon } from './FigmaIcon';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const iconButton =
  'flex h-10 items-center justify-center rounded-[8px] border border-solid border-neutral-100 bg-white px-2.5 transition-colors hover:border-primary-600';

/**
 * Figma "Standard Header": no fill, p-16, r16. Title is Plus Jakarta Sans SemiBold 24/44,
 * on the right two 40px outline icon buttons (notifications, settings) 8px apart.
 */
export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-8 overflow-clip rounded-[16px] p-4">
      <button
        type="button"
        onClick={onMenuClick}
        className={`${iconButton} -ml-1 lg:hidden`}
        aria-label="Open menu"
      >
        <Menu className="size-5 text-neutral-700" />
      </button>

      {/* A real <h1> would pick up the global Outfit !important heading rule, so use role=heading */}
      <div
        role="heading"
        aria-level={1}
        className="min-w-0 flex-1 truncate font-jakarta text-[24px] font-semibold leading-[44px] text-neutral-800"
      >
        {title}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" className={iconButton} aria-label="Notifications">
          <FigmaIcon src={figma.bell} size={20} />
        </button>
        <button type="button" className={iconButton} onClick={() => navigate('/settings')} aria-label="Settings">
          <FigmaIcon src={figma.settingsHeader} size={20} />
        </button>
      </div>
    </header>
  );
};
