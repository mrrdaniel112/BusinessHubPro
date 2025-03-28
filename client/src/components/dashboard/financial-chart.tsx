import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChartData = {
  labels: string[];
  revenue: number[];
  expenses: number[];
};

type ChartView = "revenue" | "expenses" | "combined";

interface FinancialChartProps {
  data: ChartData;
  isLoading?: boolean;
}

export default function FinancialChart({ data, isLoading = false }: FinancialChartProps) {
  const [viewMode, setViewMode] = useState<ChartView>("combined");

  // Convert array data to format required by Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    revenue: data.revenue[index],
    expenses: data.expenses[index],
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Financial Overview</h3>
          <div className="inline-flex shadow-sm rounded-md">
            <Button
              type="button"
              variant={viewMode === "revenue" ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-r-none text-xs",
                viewMode === "revenue" ? "bg-primary-600" : ""
              )}
              onClick={() => setViewMode("revenue")}
            >
              Revenue
            </Button>
            <Button
              type="button"
              variant={viewMode === "expenses" ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-none text-xs",
                viewMode === "expenses" ? "bg-primary-600" : ""
              )}
              onClick={() => setViewMode("expenses")}
            >
              Expenses
            </Button>
            <Button
              type="button"
              variant={viewMode === "combined" ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-l-none text-xs",
                viewMode === "combined" ? "bg-primary-600" : ""
              )}
              onClick={() => setViewMode("combined")}
            >
              Combined
            </Button>
          </div>
        </div>
        
        <div className="h-[220px] mt-4">
          {isLoading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
              <p className="text-gray-400">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                {(viewMode === "revenue" || viewMode === "combined") && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Revenue"
                  />
                )}
                {(viewMode === "expenses" || viewMode === "combined") && (
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Expenses"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
