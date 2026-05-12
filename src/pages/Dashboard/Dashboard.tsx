import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Calendar,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { 
  DashboardStats, 
  DashboardAlert, 
  FinancialHealthDist, 
  ParticipationDept 
} from '../../types/dashboard.types';
import HealthDistributionChart from '../../components/dashboard/HealthDistributionChart';
import DepartmentParticipationChart from '../../components/dashboard/DepartmentParticipationChart';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [healthDist, setHealthDist] = useState<FinancialHealthDist | null>(null);
  const [deptParticipation, setDeptParticipation] = useState<ParticipationDept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, alertsData, healthData, deptData] = await Promise.all([
          HrService.getDashboardStats(),
          HrService.getDashboardAlerts(),
          HrService.getFinancialHealthDistribution(),
          HrService.getParticipationByDepartment(),
        ]);
        setStats(statsData);
        setAlerts(alertsData);
        setHealthDist(healthData);
        setDeptParticipation(deptData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[var(--color-text-secondary)] font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col gap-4 rounded-[2.5rem] border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Company dashboard</p>
          <div>
            <h1 className="text-3xl font-bold font-heading text-[var(--color-text-primary)]">Overview</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)] font-medium">
              Real-time insights into employee financial wellness and program engagement.
            </p>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Monitored Employees" 
          value={stats?.employeeMonitored || 0}
          icon={Users}
          trend={stats?.employeeMonitoredChange ? { value: parseFloat(stats.employeeMonitoredChange), isPositive: stats.employeeMonitoredChange.startsWith('+') } : undefined}
        />
        <StatCard 
          title="Avg Financial Health" 
          value={`${stats?.avgFinancialHealth || 0}/100`}
          icon={TrendingUp}
        />
        <StatCard 
          title="Participation Rate" 
          value={`${stats?.participationRate || 0}%`}
          icon={Star}
          trend={stats?.participationRateChange ? { value: parseFloat(stats.participationRateChange), isPositive: stats.participationRateChange.startsWith('+') } : undefined}
        />
        <StatCard 
          title="Sessions This Month" 
          value={stats?.sessionsThisPeriod || 0}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <HealthDistributionChart data={healthDist} />
          </Card>
          <Card className="p-8">
            <DepartmentParticipationChart data={deptParticipation} />
          </Card>
        </div>

        {/* Alerts & Insights Section */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl bg-[var(--color-bg-card)] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertCircle className="w-24 h-24 text-[var(--color-primary)]" />
            </div>
            
            <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2 relative z-10 text-[var(--color-text-primary)]">
              <AlertCircle className="w-5 h-5 text-[var(--color-primary)]" />
              Critical Alerts
            </h3>
            
            <div className="space-y-4 relative z-10">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-2xl border flex gap-3 transition-all hover:scale-[1.02] ${
                      alert.type === 'error' ? 'bg-[var(--color-error)]/5 border-[var(--color-error)]/10 text-[var(--color-error)]' :
                      alert.type === 'warning' ? 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]/10 text-[var(--color-warning-darkest)]' :
                      'bg-[var(--color-success-bg)] border-[var(--color-success)]/10 text-[var(--color-success-darkest)]'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight">{alert.title}</p>
                      <p className="text-xs mt-1 opacity-80 font-medium">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-[var(--color-success-bg)] text-[var(--color-success-darkest)] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm font-bold uppercase tracking-wider">All systems green</p>
                  <p className="text-[var(--color-text-tertiary)] text-xs mt-1 font-medium">No critical alerts found.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8 bg-[var(--color-primary)] text-white border-none shadow-2xl overflow-hidden relative group">
             <div className="absolute -bottom-6 -right-6 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <TrendingUp className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-4 relative z-10">Quick Insight</h3>
            <p className="text-sm opacity-90 leading-relaxed relative z-10 font-medium">
              Employees in the <b>Engineering</b> department show a 15% higher engagement rate after attending financial literacy workshops.
            </p>
            <Button variant="ghost" className="mt-8 px-0 text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 hover:translate-x-1 transition-transform relative z-10 text-white hover:bg-white/10">
              View Detailed Report <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
