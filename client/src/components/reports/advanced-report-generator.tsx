
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ReportData {
  profitLoss: {
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  balanceSheet: {
    assets: number;
    liabilities: number;
    equity: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
  };
}

export default function AdvancedReportGenerator() {
  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ['/api/reports/financial'],
  });

  if (isLoading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Revenue</span>
              <span>${data?.profitLoss.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Expenses</span>
              <span>${data?.profitLoss.expenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Net Income</span>
              <span>${data?.profitLoss.netIncome.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Assets</span>
              <span>${data?.balanceSheet.assets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Liabilities</span>
              <span>${data?.balanceSheet.liabilities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Equity</span>
              <span>${data?.balanceSheet.equity.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Operating Activities</span>
              <span>${data?.cashFlow.operating.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Investing Activities</span>
              <span>${data?.cashFlow.investing.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Financing Activities</span>
              <span>${data?.cashFlow.financing.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
