import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Wallet, PiggyBank, TrendingUp, ShieldCheck } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { InsightsSummary } from '../../types/dashboard.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import InsightsTrendChart from '../../components/dashboard/InsightsTrendChart';
import { hiddenNote, isSuppressed, showGuarded } from '../../utils/privacy';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const Analytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ignore = false;
    HrService.getInsightsSummary()
      .then((d) => { if (!ignore) setInsights(d); })
      .catch((error) => { console.error('Failed to fetch insights:', error); if (!ignore) setFailed(true); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  // The chart draws months whose figures are visible. Newest first: the chart flips it itself.
  const trend = useMemo(
    () => (insights?.monthlySummaries ?? [])
      .filter((m) => !isSuppressed(m.totalIncome))
      .map((m) => ({ month: m.month, year: m.year, totalIncome: m.totalIncome as number, totalExpense: m.totalExpense as number, netSavings: m.netSavings as number }))
      .reverse(),
    [insights],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[var(--color-text-secondary)] font-medium">Analyzing data...</p>
      </div>
    );
  }
  if (failed || !insights) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[var(--color-text-primary)] font-semibold">We couldn't load your analytics.</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Check your connection and reload the page.</p>
      </Card>
    );
  }

  const note = isSuppressed(insights.aggregatedIncome) ? hiddenNote(insights.minCohortSize) : undefined;

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 rounded-[2.5rem] border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Corporate Insights</p>
          <div>
            <h1 className="text-3xl font-bold font-heading text-[var(--color-text-primary)]">Advanced Analytics</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)] font-medium">
              Combined money figures from employees who chose to share them with HR. No individual is ever shown.
            </p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2 px-6 print:hidden" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Print / save as PDF
        </Button>
      </header>

      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-secondary)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
        <p>
          {showGuarded(insights.sharingEmployees, (n) => `${n} of ${insights.totalEmployees} employees`, 'Too few employees')} share their data with HR.{' '}
          {insights.privacyNote} {note}
        </p>
      </div>

      {/* Latest month with enough people behind it */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Workforce Income (latest month)" value={showGuarded(insights.aggregatedIncome, inr)} icon={TrendingUp} />
        <StatCard title="Workforce Expenses (latest month)" value={showGuarded(insights.aggregatedExpense, inr)} icon={Wallet} />
        <StatCard title="Net Employee Savings (latest month)" value={showGuarded(insights.aggregatedSavings, inr)} icon={PiggyBank} />
      </div>

      <Card className="p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-xl font-bold font-heading text-[var(--color-text-primary)]">Financial Health Trends</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-medium">Combined monthly income, expenses and savings (₹) of employees who share with HR.</p>
          </div>
          <span className="px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border-primary)]">Last 6 months</span>
        </div>
        <div className="h-[400px]">
          <InsightsTrendChart data={trend} />
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
