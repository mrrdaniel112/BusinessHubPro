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
    <div className="pb-safe" onClick={handleClickOutside}>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-danger-500"></span>
            </div>
            <div className="hidden md:flex items-center relative">
              <button 
                className="flex items-center focus:outline-none" 
                aria-label="User menu"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the document click handler
                  setProfileMenuOpen(!profileMenuOpen);
                }}
              >
                {user?.profilePicture ? (
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={user.profilePicture} 
                    alt="Profile" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                  </div>
                )}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.name || "Premium User"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              
              {/* User dropdown menu */}
              {profileMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-10"
                  onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it
                >
                  {/* User info section */}
                  <div className="px-4 py-3">
                    <div className="flex items-center mb-2">
                      {user?.profilePicture ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover mr-3" 
                          src={user.profilePicture} 
                          alt="Profile" 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-3">
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || "Premium User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || "premium@example.com"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu links */}
                  <div className="py-1">
                    <a 
                      href="/calendar"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Calendar
                    </a>
                    <a 
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </a>
                  </div>
                  
                  {/* Subscription section */}
                  <div className="py-1">
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"></path>
                        <path d="m19 9-5 5-4-4-3 3"></path>
                      </svg>
                      Subscription
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Invoices
                    </a>
                  </div>
                  
                  {/* Logout section */}
                  <div className="py-1">
                    <button 
                      onClick={() => logout()}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
