export interface DashboardStats {
  employeeMonitored: number;
  employeeMonitoredChange: string;
  avgFinancialHealth: number;
  avgFinancialHealthPeriod: string;
  participationRate: number;
  participationRateChange: string;
  sessionsThisPeriod: number;
  sessionsRate: string;
}

export interface FinancialHealthDist {
  distribution: Array<{
    category: string;
    value: number;
    range: string;
  }>;
  total: number;
}

export interface ParticipationDept {
  department: string;
  total: number;
  participating: number;
  participationRate: number;
}

export interface DashboardAlert {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface InsightsSummary {
  totalEmployees: number;
  aggregatedIncome: number;
  aggregatedExpense: number;
  aggregatedSavings: number;
  monthlySummaries: Array<{
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
  }>;
}
