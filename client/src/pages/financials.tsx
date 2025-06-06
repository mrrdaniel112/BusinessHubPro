import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DateFilter from "@/components/dashboard/date-filter";
import { TransactionForm } from "@/components/forms/transaction-form";
import { DoubleEntryLedger } from "@/components/financials/double-entry-ledger";
import { ArrowRight, PieChart, BookOpen, BarChart3 } from "lucide-react";

export default function Financials() {
  const [dateRange, setDateRange] = useState<"day" | "week" | "month">("week");
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data, isLoading } = useQuery({
    queryKey: ['/api/transactions', dateRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data for the charts
  const revenueData = [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 15000 },
    { month: 'Mar', value: 18000 },
    { month: 'Apr', value: 20000 },
    { month: 'May', value: 22000 },
    { month: 'Jun', value: 24000 },
  ];

  const expensesByCategory = [
    { category: 'Office', value: 4500 },
    { category: 'Software', value: 3500 },
    { category: 'Hardware', value: 2800 },
    { category: 'Marketing', value: 2000 },
    { category: 'Utilities', value: 1200 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Management</h1>
          <Button onClick={() => setIsTransactionFormOpen(true)}>
            <i className="ri-add-line mr-1"></i> Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction form dialog */}
      <TransactionForm 
        open={isTransactionFormOpen} 
        onOpenChange={setIsTransactionFormOpen} 
      />

      {/* Main tabs for different financial views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Financial Overview
            </TabsTrigger>
            <TabsTrigger value="accounting" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Double-Entry Accounting
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Date filter */}
            <div className="mb-6">
              <DateFilter onRangeChange={setDateRange} />
            </div>

            {/* Financial overview cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-md bg-primary-50">
                      <i className="ri-money-dollar-circle-line text-xl text-primary-600"></i>
                    </div>
                    <span className="text-sm font-medium text-success-600">↑ 12%</span>
                  </div>
                  <h3 className="text-sm text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-bold">$48,500</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-md bg-danger-50">
                      <i className="ri-shopping-bag-line text-xl text-danger-600"></i>
                    </div>
                    <span className="text-sm font-medium text-danger-600">↑ 8%</span>
                  </div>
                  <h3 className="text-sm text-gray-500">Total Expenses</h3>
                  <p className="text-2xl font-bold">$24,000</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-md bg-success-50">
                      <i className="ri-line-chart-line text-xl text-success-600"></i>
                    </div>
                    <span className="text-sm font-medium text-success-600">↑ 15%</span>
                  </div>
                  <h3 className="text-sm text-gray-500">Net Profit</h3>
                  <p className="text-2xl font-bold">$24,500</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-md bg-warning-50">
                      <i className="ri-wallet-line text-xl text-warning-600"></i>
                    </div>
                    <span className="text-sm font-medium text-warning-600">$ 32,600</span>
                  </div>
                  <h3 className="text-sm text-gray-500">Pending Payments</h3>
                  <p className="text-2xl font-bold">6 invoices</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue trend chart */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                        <p className="text-gray-400">Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Revenue" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expenses by category */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                        <p className="text-gray-400">Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expensesByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                          <Legend />
                          <Bar 
                            dataKey="value" 
                            name="Expenses" 
                            fill="#ef4444" 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent transactions */}
            <div className="mt-8 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("accounting")}
                    className="flex items-center"
                  >
                    View Ledger <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                            <div>
                              <div className="h-4 w-40 bg-gray-200 animate-pulse mb-2 rounded"></div>
                              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                          </div>
                          <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success-100">
                            <i className="ri-arrow-down-line text-success-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Client Payment - ABC Corp</p>
                            <p className="text-sm text-gray-500">May 4, 2023</p>
                          </div>
                        </div>
                        <p className="font-medium text-success-600">+$5,400.00</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-danger-100">
                            <i className="ri-arrow-up-line text-danger-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Office Supplies</p>
                            <p className="text-sm text-gray-500">May 3, 2023</p>
                          </div>
                        </div>
                        <p className="font-medium text-danger-600">-$245.50</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-danger-100">
                            <i className="ri-arrow-up-line text-danger-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Software Subscription</p>
                            <p className="text-sm text-gray-500">May 1, 2023</p>
                          </div>
                        </div>
                        <p className="font-medium text-danger-600">-$49.99</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success-100">
                            <i className="ri-arrow-down-line text-success-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Client Payment - XYZ Ltd</p>
                            <p className="text-sm text-gray-500">April 29, 2023</p>
                          </div>
                        </div>
                        <p className="font-medium text-success-600">+$3,200.00</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-danger-100">
                            <i className="ri-arrow-up-line text-danger-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Marketing Campaign</p>
                            <p className="text-sm text-gray-500">April 25, 2023</p>
                          </div>
                        </div>
                        <p className="font-medium text-danger-600">-$1,200.00</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounting">
            <DoubleEntryLedger />
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generate and download professional financial reports for your business.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-file-list-3-line text-3xl mb-2 text-blue-600"></i>
                      <span>Income Statement</span>
                    </Button>
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-scales-3-line text-3xl mb-2 text-purple-600"></i>
                      <span>Balance Sheet</span>
                    </Button>
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-flow-chart text-3xl mb-2 text-green-600"></i>
                      <span>Cash Flow Statement</span>
                    </Button>
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-line-chart-line text-3xl mb-2 text-yellow-600"></i>
                      <span>Profit & Loss</span>
                    </Button>
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-pie-chart-2-line text-3xl mb-2 text-red-600"></i>
                      <span>Expense Report</span>
                    </Button>
                    <Button className="flex flex-col items-center justify-center h-32 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <i className="ri-file-chart-line text-3xl mb-2 text-indigo-600"></i>
                      <span>Custom Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Preparation</CardTitle>
                  <CardDescription>Prepare your tax documents using data from your double-entry accounting system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center justify-between p-4 h-auto">
                      <div className="flex items-center">
                        <i className="ri-calendar-check-line text-2xl mr-3 text-blue-600"></i>
                        <div className="text-left">
                          <p className="font-medium">Quarterly Tax Preparation</p>
                          <p className="text-sm text-gray-500">Generate quarterly tax documents</p>
                        </div>
                      </div>
                      <i className="ri-arrow-right-line"></i>
                    </Button>
                    <Button variant="outline" className="flex items-center justify-between p-4 h-auto">
                      <div className="flex items-center">
                        <i className="ri-government-line text-2xl mr-3 text-blue-600"></i>
                        <div className="text-left">
                          <p className="font-medium">Annual Tax Report</p>
                          <p className="text-sm text-gray-500">Prepare end-of-year tax documents</p>
                        </div>
                      </div>
                      <i className="ri-arrow-right-line"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
