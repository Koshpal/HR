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

/** `GET /hr/impact` — what the programme is doing for the company. Aggregates only; every figure may be hidden. */
export interface ImpactFunnelStep { key: string; label: string; count: Guarded; pct: Guarded }
export interface ImpactSummary {
  generatedAt: string;
  minCohortSize: number;
  activeEmployees: number;
  funnel: ImpactFunnelStep[];
  habits: {
    employeesWithBudget: Guarded;
    employeesWithGoal: Guarded;
    employeesReachingAGoal: Guarded;
    goalsAchieved: Guarded;
    actionItemCompletionPct: Guarded;
  };
  outcomes: {
    windowDays: number;
    sharingEmployees: Guarded;
    employeesWithScore: Guarded;
    currentAvgScore: Guarded;
    comparableEmployees: Guarded;
    avgScoreChange: Guarded;
    avgStartScore: Guarded;
    avgLatestScore: Guarded;
    improvedPct: Guarded;
    steadyPct: Guarded;
    declinedPct: Guarded;
    focusAreas: Array<{ key: string; label: string; avgPctOfMax: Guarded }>;
    trend: Array<{ month: string; employees: Guarded; avgScore: Guarded }>;
  };
  coaching: {
    employeesCoached: Guarded;
    coachedPct: Guarded;
    sessionsCompleted: Guarded;
    hoursDelivered: Guarded;
    scoreChangeComparison:
      | Suppressed
      | { coached: { employees: number; avgChange: number }; notCoached: { employees: number; avgChange: number } };
    comparisonNote: string;
  };
  headlines: Array<{ tone: 'positive' | 'neutral'; text: string }>;
  privacyNote: string;
}
