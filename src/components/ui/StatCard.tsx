import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="rounded-3xl border shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-[180px] p-6 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] group hover:bg-[var(--color-primary)]">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-white group-hover:text-[var(--color-primary)] transition-all">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-[var(--color-success-bg)] text-[var(--color-success-darkest)] group-hover:bg-white group-hover:text-emerald-600' : 'bg-[var(--color-error)]/10 text-[var(--color-error)] group-hover:bg-white group-hover:text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider group-hover:text-white/80">{title}</p>
        <p className="text-3xl font-bold font-heading text-[var(--color-text-primary)] mt-1 group-hover:text-white">{value}</p>
      </div>
    </div>
  );
};
