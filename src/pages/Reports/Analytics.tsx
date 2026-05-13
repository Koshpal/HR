import React, { useState, useEffect } from 'react';
import { Download, DollarSign, Wallet, PiggyBank, BarChart3, PieChart } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { InsightsSummary } from '../../types/dashboard.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import InsightsTrendChart from '../../components/dashboard/InsightsTrendChart';

const Analytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await HrService.getInsightsSummary();
        setInsights(data);
      } catch (error: any) {
        // Some backend environments do not expose this endpoint yet.
        if (error?.response?.status === 404) {
          setInsights(null);
        } else {
          console.error('Failed to fetch insights:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[var(--color-text-secondary)] font-medium">Analyzing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 rounded-[2.5rem] border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Corporate Insights</p>
          <div>
            <h1 className="text-3xl font-bold font-heading text-[var(--color-text-primary)]">Advanced Analytics</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)] font-medium">
              Aggregated financial metrics and longitudinal trends for your workforce.
            </p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2 px-6">
          <Download className="w-4 h-4" />
          Export PDF Report
        </Button>
      </header>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Workforce Income" 
          value={`$${((insights?.aggregatedIncome || 0) / 1000000).toFixed(1)}M`}
          icon={DollarSign}
        />
        <StatCard 
          title="Workforce Expenses" 
          value={`$${((insights?.aggregatedExpense || 0) / 1000000).toFixed(1)}M`}
          icon={Wallet}
        />
        <StatCard 
          title="Net Employee Savings" 
          value={`$${((insights?.aggregatedSavings || 0) / 1000000).toFixed(1)}M`}
          icon={PiggyBank}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-[var(--color-text-primary)]">Financial Health Trends</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-medium">Aggregated monthly income, expenses, and savings across all departments.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border-primary)]">Last 12 Months</span>
            </div>
          </div>
          <div className="h-[400px]">
             <InsightsTrendChart data={insights?.monthlySummaries || []} />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 group cursor-default hover:border-[var(--color-primary)]/30 transition-all">
            <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-8 transition-transform group-hover:scale-110 duration-500">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--color-text-primary)]">Departmental ROI Analysis</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed font-medium">
              Compare the financial health improvement across different business units to identify high-impact areas for future coaching programs.
            </p>
            <Button variant="ghost" className="mt-8 px-0 text-sm font-bold text-[var(--color-primary)] hover:translate-x-1 transition-transform uppercase tracking-wider">
              Explore Departmental Data &rarr;
            </Button>
          </Card>

          <Card className="p-10 group cursor-default hover:border-[var(--color-secondary)]/30 transition-all">
            <div className="w-14 h-14 bg-[var(--color-secondary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-secondary)] mb-8 transition-transform group-hover:scale-110 duration-500">
              <PieChart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--color-text-primary)]">Engagement Segmentation</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed font-medium">
              Break down your workforce into participation segments (Active vs. Passive) and analyze the financial impact of coaching engagement.
            </p>
            <Button variant="ghost" className="mt-8 px-0 text-sm font-bold text-[var(--color-secondary)] hover:translate-x-1 transition-transform uppercase tracking-wider">
              View Segmentation &rarr;
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
