import { fetchAPI } from '@/lib/api';

export interface DashboardData {
  month: string;
  user: { name: string };
  balance: { total: number };
  summary: {
    income: { amount: number; changePercentage: number };
    expense: { amount: number; changePercentage: number };
  };
  trend: { month: string; totalExpense: number }[];
  categories: {
    categoryName: string;
    totalAmount: number;
    percentage: number;
  }[];
  recentTransactions: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    subCategoryName: string;
    categoryName: string;
  }[];
  budgets: {
    categoryName: string;
    limitAmount: number;
    spentAmount: number;
    percentage: number;
    isExceeded: boolean;
  }[];
}

export interface MonthlyData {
  month: string;
  chart: {
    month: string;
    monthLabel: string;
    totalIncome: number;
    totalExpense: number;
  }[];
  summary: {
    avgExpense: number;
    bestMonth: string;
    totalSavings: number;
  };
}

export interface YearlyData {
  year: number;
  chart: {
    month: string;
    monthLabel: string;
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
  }[];
  summary: {
    totalIncome: { amount: number; rangeLabel: string; status: string };
    totalExpense: { amount: number; rangeLabel: string; status: string };
  };
}

export async function fetchDashboardSummary(): Promise<DashboardData> {
  const token = localStorage.getItem('accessToken');

  const res = await fetchAPI('/dashboard/summary', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as DashboardData;
}

export async function fetchDashboardMonthly(): Promise<MonthlyData> {
  const token = localStorage.getItem('accessToken');

  const res = await fetchAPI('/dashboard/monthly', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as MonthlyData;
}

export async function fetchDashboardYearly(): Promise<YearlyData> {
  const token = localStorage.getItem('accessToken');

  const res = await fetchAPI('/dashboard/yearly', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as YearlyData;
}
