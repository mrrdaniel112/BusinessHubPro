import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import KeyMetrics, { MetricData } from "@/components/dashboard/key-metrics";
import DateFilter from "@/components/dashboard/date-filter";
import FinancialChart, { ChartData } from "@/components/dashboard/financial-chart";
import CashFlowForecast from "@/components/dashboard/cash-flow-forecast";
import RecentTransactions, { Transaction } from "@/components/dashboard/recent-transactions";
import InvoicesOverview, { Invoice, InvoiceStats } from "@/components/dashboard/invoices-overview";
import AiInsights, { Insight } from "@/components/dashboard/ai-insights";
import QuickActions from "@/components/dashboard/quick-actions";

type DashboardData = {
  metrics: MetricData;
  recentTransactions: Transaction[];
  invoiceStats: InvoiceStats;
  recentInvoices: Invoice[];
  chartData: ChartData;
  cashFlowForecast: {
    forecast: number[];
    insight: string;
  };
  insights: Insight[];
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<"day" | "week" | "month">("week");
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', dateRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDateRangeChange = (range: "day" | "week" | "month") => {
    setDateRange(range);
  };

  // Use empty placeholder data while loading
  const emptyData = {
    metrics: {
      revenue: { value: 0, change: 0 },
      expenses: { value: 0, change: 0 },
      profit: { value: 0, change: 0 },
      inventory: { total: 0, lowStock: 0 }
    },
    recentTransactions: [],
    invoiceStats: {
      pending: 0,
      pendingAmount: 0,
      overdue: 0,
      overdueAmount: 0,
      paid: 0,
      paidAmount: 0
    },
    recentInvoices: [],
    chartData: {
      labels: [],
      revenue: [],
      expenses: []
    },
    cashFlowForecast: {
      forecast: [],
      insight: ""
    },
    insights: []
  };
  
  // Use data from API or placeholder data while loading
  const displayData = data || emptyData;

  return (
    <div className="pb-safe">
      {/* Dashboard header */}
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Business Dashboard</h1>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <button 
                type="button" 
                className="p-2 bg-white text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Notifications"
              >
                <i className="ri-notification-3-line text-xl"></i>
              </button>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-danger-500"></span>
            </div>
            <div className="hidden md:flex items-center">
              <img 
                className="h-8 w-8 rounded-full" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
              />
              <span className="ml-2 text-sm font-medium text-gray-700">John Smith</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date filter */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mb-4 sm:mb-6">
        <DateFilter onRangeChange={handleDateRangeChange} />
      </div>

      {/* Key metrics */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        <KeyMetrics data={displayData.metrics} isLoading={isLoading} />
      </div>

      {/* Charts section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          <FinancialChart data={displayData.chartData} isLoading={isLoading} />
          <CashFlowForecast data={displayData.cashFlowForecast} isLoading={isLoading} />
        </div>
      </div>

      {/* Transactions and Invoices section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          <RecentTransactions transactions={displayData.recentTransactions} isLoading={isLoading} />
          <InvoicesOverview 
            invoices={displayData.recentInvoices} 
            stats={displayData.invoiceStats}
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* AI Insights section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-6 sm:mt-8">
        <AiInsights insights={displayData.insights} isLoading={isLoading} />
      </div>

      {/* Quick Actions section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-6 sm:mt-8 mb-6 sm:mb-8">
        <QuickActions />
      </div>
    </div>
  );
}
