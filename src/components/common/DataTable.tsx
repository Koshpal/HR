import React from 'react';
import { figma } from '../../assets/figma';
import { FigmaIcon } from './FigmaIcon';
import { Avatar } from './Avatar';

/**
 * Building blocks for the Figma "Employee Directory" / "Session Reports" cards.
 * The design lays the table out as five columns that share the 1080px width:
 * the name column is at least 240px, the "wide" ones at least 180px, the rest flex.
 */

export const SEARCH_BOX = 'w-full sm:w-[300px]';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Figma "Search / Tiny": 300×40, 8px radius, 20px icon, Outfit 12/22 placeholder. */
export const SearchField: React.FC<SearchFieldProps> = ({ value, onChange, placeholder = 'Search...' }) => (
  <label
    className={`${SEARCH_BOX} flex h-10 items-center gap-2 rounded-[8px] border border-solid border-neutral-100 bg-white px-2.5 transition-colors focus-within:border-primary-600`}
  >
    <FigmaIcon src={figma.search} size={20} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-w-0 flex-1 border-0 bg-transparent p-0 font-outfit text-[12px] font-normal leading-[22px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
    />
  </label>
);

type ButtonVariant = 'filled' | 'outline' | 'neutral';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  filled: 'bg-primary-600 text-white',
  outline: 'border border-solid border-primary-600 text-primary-600',
  neutral: 'border border-solid border-neutral-100 text-neutral-700',
};

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  icon: string;
}

/** Figma toolbar button: h-40, r8, pl-10/pr-16, 20px icon + Outfit 14/24 label. */
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ variant, icon, children, className = '', ...props }) => (
  <button
    type="button"
    className={`flex h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[8px] pl-2.5 pr-4 font-outfit text-[14px] font-normal leading-6 transition-opacity hover:opacity-90 disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    {...props}
  >
    <FigmaIcon src={icon} size={20} />
    {children}
  </button>
);

/** The card that wraps toolbar + table + footer. */
export const TableCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="flex w-full flex-col gap-6 overflow-clip rounded-[8px] bg-white p-4 shadow-low">{children}</section>
);

export const Toolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex w-full flex-col justify-center gap-4 rounded-[16px] p-4 md:flex-row md:items-center md:justify-between">
    {children}
  </div>
);

interface TableGridProps {
  /** Tailwind grid-template-columns class for the five columns. */
  cols: string;
  headers: Array<{ label: string; center?: boolean }>;
  children: React.ReactNode;
}

const cell = 'flex items-center border-b border-solid border-neutral-100 p-4';

export const TableGrid: React.FC<TableGridProps> = ({ cols, headers, children }) => (
  <div className="w-full overflow-x-auto">
    <div role="table" className="min-w-[900px]">
      <div role="row" className={`grid ${cols}`}>
        {headers.map((h) => (
          <div
            key={h.label}
            role="columnheader"
            className={`flex h-14 border-b border-solid border-neutral-100 p-4 font-outfit text-[14px] font-normal leading-6 text-neutral-800 ${
              h.center ? 'items-center justify-center' : 'items-start'
            }`}
          >
            <span className="min-w-0 truncate">{h.label}</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  </div>
);

export const TableRow: React.FC<{ cols: string; children: React.ReactNode }> = ({ cols, children }) => (
  <div role="row" className={`grid ${cols}`}>
    {children}
  </div>
);

interface TableCellProps {
  children?: React.ReactNode;
  center?: boolean;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, center, className = '' }) => (
  <div role="cell" className={`${cell} h-20 min-w-0 ${center ? 'justify-center' : ''} ${className}`}>
    {children}
  </div>
);

/** A full-width message row (loading / empty). */
export const TableMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center border-b border-solid border-neutral-100 px-4 py-20 font-outfit text-[14px] leading-6 text-neutral-500">
    {children}
  </div>
);

interface PersonCellProps {
  name: string;
  email?: string;
  photo?: string;
}

/** Figma name cell: 40px avatar, Geist Medium 16/28 name over Geist 12/22 email. */
export const PersonCell: React.FC<PersonCellProps> = ({ name, email, photo }) => (
  <div className="flex min-w-0 flex-1 items-center gap-2">
    <Avatar name={name} photo={photo} />
    <div className="flex min-w-0 flex-1 flex-col items-start justify-center whitespace-nowrap">
      <p className={`w-full truncate font-geist text-[16px] font-medium leading-7 text-neutral-800 ${email ? 'mb-[-3px]' : ''}`}>
        {name}
      </p>
      {email && <p className="w-full truncate font-geist text-[12px] font-normal leading-[22px] text-neutral-500">{email}</p>}
    </div>
  </div>
);

export type ChipTone = 'success' | 'warning' | 'danger';

const CHIP_STYLES: Record<ChipTone, string> = {
  success: 'bg-success-50 text-success-600 font-geist',
  warning: 'bg-warning-50 text-warning-600 font-outfit',
  danger: 'bg-error-50 text-error-600 font-outfit',
};

/** Figma "Chips": h-32 pill, min-w-84, 10/18 label. */
export const StatusChip: React.FC<{ tone: ChipTone; children: React.ReactNode }> = ({ tone, children }) => (
  <div className={`flex h-8 min-w-[84px] items-center justify-center rounded-[20px] px-4 ${CHIP_STYLES[tone]}`}>
    <span className="whitespace-nowrap text-center text-[10px] font-normal leading-[18px]">{children}</span>
  </div>
);

/** Three-page sliding window followed by an ellipsis, as in the Figma "1 2 3 …" pager. */
const pageWindow = (page: number, totalPages: number): Array<number | 'more'> => {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  const pages: Array<number | 'more'> = [start, start + 1, start + 2];
  if (start + 2 < totalPages) pages.push('more');
  return pages;
};

const pagerButton =
  'flex size-8 shrink-0 items-center justify-center overflow-clip rounded-[8px] border border-solid border-neutral-25 p-1.5 disabled:opacity-50';

interface TableFooterProps {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Figma footer: "Showing 1-5 from 50" and the 32px pager. */
export const TableFooter: React.FC<TableFooterProps> = ({ from, to, total, page, totalPages, onPageChange }) => (
  <div className="flex w-full flex-wrap items-center gap-3">
    <p className="min-w-0 flex-1 font-outfit text-[14px] font-normal leading-6 text-neutral-500">
      Showing {from}-{to} from {total}
    </p>
    <div className="flex items-start gap-2">
      <button
        type="button"
        className={pagerButton}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <FigmaIcon src={figma.pageLeft} size={20} />
      </button>
      {pageWindow(page, totalPages).map((item, i) =>
        item === 'more' ? (
          <button
            key={`more-${i}`}
            type="button"
            className={`${pagerButton} font-outfit text-[12px] font-normal leading-[22px] text-neutral-800`}
            onClick={() => onPageChange(Math.min(totalPages, page + 3))}
            aria-label="More pages"
          >
            ...
          </button>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${pagerButton} text-center ${
              item === page
                ? 'bg-primary-500 font-geist text-[14px] font-medium leading-[26px] text-white'
                : 'font-outfit text-[12px] font-normal leading-[22px] text-neutral-800'
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={pagerButton}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <FigmaIcon src={figma.pageRight} size={20} />
      </button>
    </div>
  </div>
);
