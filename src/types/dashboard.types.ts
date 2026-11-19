/** A figure the server hid because fewer than the minimum number of people are behind it. */
export interface Suppressed { suppressed: true; reason: 'SMALL_COHORT' }
export type Guarded<T = number> = T | Suppressed;

export interface DashboardStats {
  employeeMonitored: number;
  avgFinancialHealth: Guarded;
  participationRate: Guarded;
  sessionsThisPeriod: number;
  minCohortSize?: number;
  period?: StatsPeriod;
}

export type StatsPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface FinancialHealthDist {
  distribution: Array<{
    category: string;
    value: Guarded;
    range: string;
    count?: Guarded;
  }>;
  total: Guarded;
  suppressed?: boolean;
  minCohortSize?: number;
}

export interface ParticipationDept {
  department: string;
  count: number;
  participationRate: Guarded;
}

export interface DashboardAlert {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface InsightsSummary {
  minCohortSize: number;
  totalEmployees: number;
  sharingEmployees: Guarded;
  aggregatedIncome: Guarded;
  aggregatedExpense: Guarded;
  aggregatedSavings: Guarded;
  monthlySummaries: Array<{
    month: number;
    year: number;
    totalIncome: Guarded;
    totalExpense: Guarded;
    netSavings: Guarded;
  }>;
  privacyNote: string;
}

export interface SessionsSummary {
  minCohortSize: number;
  windowMonths: number;
  totalSessions: Guarded;
  byStatus: Array<{ status: string; sessions: Guarded }>;
  byMonth: Array<{ month: string; sessions: Guarded }>;
  byDepartment: Array<{ department: string; sessions: Guarded }>;
  privacyNote: string;
}
