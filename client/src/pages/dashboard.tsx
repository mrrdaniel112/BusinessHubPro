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
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close the menu when clicking outside
  const handleClickOutside = () => {
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and key metrics
        </p>
      </div>
      
      <Separator />

      {/* Main Grid Layout */}
      <div className="grid gap-6">
        {/* Top Row - Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
            <p className="text-2xl font-bold">$24,563</p>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Expenses</h3>
            <p className="text-2xl font-bold">$12,234</p>
            <p className="text-xs text-muted-foreground">-3% from last month</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Outstanding Invoices</h3>
            <p className="text-2xl font-bold">$8,545</p>
            <p className="text-xs text-muted-foreground">12 pending invoices</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Cash Flow</h3>
            <p className="text-2xl font-bold">$4,325</p>
            <p className="text-xs text-muted-foreground">Net 30 days</p>
          </Card>
        </div>

        {/* Middle Row - Charts and Graphs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <div className="p-6">
              <h3 className="font-semibold text-lg">Revenue Overview</h3>
              <div className="h-[300px]">
                <FinancialChart data={displayData.chartData} isLoading={isLoading} />
              </div>
            </div>
          </Card>
          
          <Card className="row-span-2">
            <div className="p-6">
              <h3 className="font-semibold text-lg">Recent Activity</h3>
              <div className="mt-4 space-y-4">
                <RecentTransactions transactions={displayData.recentTransactions} isLoading={isLoading} />
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row - Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg">Inventory Status</h3>
              <div className="mt-4">
                <KeyMetrics data={displayData.metrics} isLoading={isLoading} />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg">Outstanding Tasks</h3>
              <div className="mt-4">
                {/* Tasks Component */}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg">AI Insights</h3>
              <div className="mt-4">
                <AiInsights insights={displayData.insights} isLoading={isLoading} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
