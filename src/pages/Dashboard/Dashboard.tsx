import React, { useEffect, useState } from 'react';
import { HrService } from '../../services/hr.service';
import type {
  DashboardStats,
  DashboardAlert,
  FinancialHealthDist,
  ParticipationDept,
  StatsPeriod,
} from '../../types/dashboard.types';
import HealthDistributionChart from '../../components/dashboard/HealthDistributionChart';
import DepartmentParticipationChart from '../../components/dashboard/DepartmentParticipationChart';
import AlertsCard from '../../components/dashboard/AlertsCard';
import { FigmaIcon } from '../../components/common/FigmaIcon';
import { figma } from '../../assets/figma';
import { asChartNumber, hiddenNote, isSuppressed, showGuarded } from '../../utils/privacy';

interface SummaryCardProps {
  bg: string;
  iconBg: string;
  iconClass: string;
  icon: string;
  labelClass: string;
  label: string;
  value: string | number;
  /** Shown under the value, e.g. why a figure is hidden. */
  hint?: string;
}

/** Figma "Summary" tile: 44px icon chip, 16/26 label, 24/44 value. */
const SummaryCard: React.FC<SummaryCardProps> = ({ bg, iconBg, iconClass, icon, labelClass, label, value, hint }) => (
  <div className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] px-4 py-6 ${bg}`}>
    <div className="flex h-[118px] w-full flex-col items-start justify-center gap-4">
      <div className={`flex size-[44px] shrink-0 items-center ${iconBg} ${iconClass}`}>
        <FigmaIcon src={icon} size={20} />
      </div>
      <div className="flex w-full flex-col items-start">
        <p className={`w-full font-jakarta text-[16px] font-normal leading-[26px] ${labelClass}`}>{label}</p>
        <div className="flex h-8 w-full items-center">
          <p className="whitespace-nowrap font-jakarta text-[24px] font-semibold leading-[44px] text-neutral-800">
            {value}
          </p>
        </div>
        {hint && <p className="font-outfit text-[12px] leading-5 text-neutral-500">{hint}</p>}
      </div>
    </div>
  </div>
);

const PERIODS: Array<{ value: StatsPeriod; label: string; unit: string }> = [
  { value: 'weekly', label: 'Weekly', unit: 'WEEK' },
  { value: 'monthly', label: 'Monthly', unit: 'MONTH' },
  { value: 'quarterly', label: 'Quarterly', unit: 'QUARTER' },
  { value: 'yearly', label: 'Yearly', unit: 'YEAR' },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [healthDist, setHealthDist] = useState<FinancialHealthDist | null>(null);
  const [deptParticipation, setDeptParticipation] = useState<ParticipationDept[]>([]);
  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  const [loading, setLoading] = useState(true);

  // Summary tiles follow the period selector
  useEffect(() => {
    let ignore = false;
    HrService.getDashboardStats(period)
      .then((result) => { if (!ignore) setStats(result); })
      .catch((error) => console.warn('getDashboardStats failed:', error));
    return () => { ignore = true; };
  }, [period]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          HrService.getDashboardAlerts(),
          HrService.getFinancialHealthDistribution(),
          HrService.getParticipationByDepartment(),
        ]);

        if (results[0].status === 'fulfilled') setAlerts(results[0].value);
        else console.warn('getDashboardAlerts failed:', results[0]);

        if (results[1].status === 'fulfilled') setHealthDist(results[1].value);
        else console.warn('getFinancialHealthDistribution failed:', results[1]);

        if (results[2].status === 'fulfilled') setDeptParticipation(results[2].value);
        else console.warn('getParticipationByDepartment failed:', results[2]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // The charts draw plain numbers; figures the server hid are drawn as zero and labelled as hidden.
  const chartHealth = healthDist && {
    ...healthDist,
    total: asChartNumber(healthDist.total),
    distribution: healthDist.distribution.map((b) => (isSuppressed(b.value) ? { ...b, category: `${b.category} (hidden)`, value: 0, count: 0 } : { ...b, value: asChartNumber(b.value), count: asChartNumber(b.count) })),
  };
  const chartDepts = deptParticipation.map((d) => ({ ...d, department: isSuppressed(d.participationRate) ? `${d.department} (hidden)` : d.department, participationRate: asChartNumber(d.participationRate) }));

  const periodInfo = PERIODS.find((p) => p.value === period) ?? PERIODS[1];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-t-transparent" />
        <p className="mt-4 font-outfit text-[14px] leading-6 text-neutral-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-8">
      {/* Summary */}
      <section className="flex flex-col gap-4 rounded-[8px] bg-white p-4 shadow-low">
        <div className="flex w-full items-center justify-between">
          <p className="font-jakarta text-[18px] font-semibold leading-8 text-neutral-800">Summary</p>
          {/* Figma dropdown face over a native select */}
          <label className="relative flex h-10 cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-solid border-neutral-100 pl-4 pr-2.5 transition-colors focus-within:border-primary-600">
            <span className="font-outfit text-[14px] font-normal leading-6 text-neutral-700">{periodInfo.label}</span>
            <FigmaIcon src={figma.angleDown} size={20} />
            <select
              aria-label="Summary period"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              value={period}
              onChange={(e) => setPeriod(e.target.value as StatsPeriod)}
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:h-[196px]">
          <SummaryCard
            bg="bg-success-50"
            iconBg="bg-success-500"
            iconClass="rounded-[24.917px] p-[11.5px]"
            icon={figma.iconCheck}
            labelClass="text-success-900"
            label="Monitored Employees"
            value={stats ? stats.employeeMonitored : '—'}
          />
          <SummaryCard
            bg="bg-info-50"
            iconBg="bg-primary-300"
            iconClass="rounded-[26px] p-3"
            icon={figma.iconTrendUpCircle}
            labelClass="text-primary-800"
            label="AVG FINANCIAL HEALTH"
            value={stats ? showGuarded(stats.avgFinancialHealth, (n) => `${n}/ 100`) : '—'}
            hint={stats && isSuppressed(stats.avgFinancialHealth) ? hiddenNote(stats.minCohortSize) : undefined}
          />
          <SummaryCard
            bg="bg-warning-50"
            iconBg="bg-warning-500"
            iconClass="rounded-[26px] p-3"
            icon={figma.iconUserEye}
            labelClass="text-warning-900"
            label="PARTICIPATION RATE"
            value={stats ? showGuarded(stats.participationRate, (n) => `${n}%`) : '—'}
            hint={stats && isSuppressed(stats.participationRate) ? hiddenNote(stats.minCohortSize) : undefined}
          />
          <SummaryCard
            bg="bg-secondary-50"
            iconBg="bg-secondary-600"
            iconClass="rounded-[26px] p-3"
            icon={figma.iconClock}
            labelClass="text-secondary-800"
            label={`SESSIONS THIS ${periodInfo.unit}`}
            value={stats ? stats.sessionsThisPeriod : '—'}
          />
        </div>
      </section>

      {/* Financial Health Distribution + Alerts */}
      <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center">
        <HealthDistributionChart data={chartHealth} />
        <AlertsCard alerts={alerts} />
      </div>

      {/* Participation by Department */}
      <DepartmentParticipationChart data={chartDepts} />
      {(healthDist?.suppressed || deptParticipation.some((d) => isSuppressed(d.participationRate))) && (
        <p className="font-outfit text-[13px] text-neutral-500">{hiddenNote(stats?.minCohortSize ?? healthDist?.minCohortSize)} Groups below that size are shown as zero or left out so no individual can be identified.</p>
      )}
    </div>
  );
};

export default Dashboard;
