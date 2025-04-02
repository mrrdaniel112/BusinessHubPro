import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function BusinessAnalytics() {
  const [timeframe, setTimeframe] = useState("6m");

  // Mock data - replace with real API calls
  const { data: financialData } = useQuery({
    queryKey: ["financial-data", timeframe],
    queryFn: async () => {
      return {
        revenue: [
          { month: "Jan", amount: 45000 },
          { month: "Feb", amount: 52000 },
          { month: "Mar", amount: 48000 },
          { month: "Apr", amount: 55000 },
          { month: "May", amount: 60000 },
          { month: "Jun", amount: 58000 },
        ],
        expenses: [
          { month: "Jan", amount: 35000 },
          { month: "Feb", amount: 38000 },
          { month: "Mar", amount: 42000 },
          { month: "Apr", amount: 40000 },
          { month: "May", amount: 45000 },
          { month: "Jun", amount: 43000 },
        ],
        profitByCategory: [
          { name: "Products", value: 40000 },
          { name: "Services", value: 30000 },
          { name: "Consulting", value: 20000 },
          { name: "Other", value: 10000 },
        ],
      };
    },
  });

  const { data: businessMetrics } = useQuery({
    queryKey: ["business-metrics", timeframe],
    queryFn: async () => {
      return {
        totalRevenue: 318000,
        totalExpenses: 243000,
        netProfit: 75000,
        profitMargin: 23.6,
        averageOrderValue: 1250,
        customerRetentionRate: 85,
        inventoryTurnover: 4.2,
        accountsReceivable: 45000,
        accountsPayable: 32000,
      };
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-gray-500">Track your business performance</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${businessMetrics?.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${businessMetrics?.netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {businessMetrics?.profitMargin}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {businessMetrics?.customerRetentionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData?.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#82ca9d"
                      name="Expenses"
                      data={financialData?.expenses}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData?.profitByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financialData?.profitByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessMetrics?.inventoryTurnover}x
                </div>
                <p className="text-sm text-gray-500">
                  Average inventory turnover rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${businessMetrics?.averageOrderValue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  Average value per order
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessMetrics?.customerRetentionRate}%
                </div>
                <p className="text-sm text-gray-500">
                  Percentage of customers retained
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${businessMetrics?.accountsReceivable.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  Outstanding customer payments
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 