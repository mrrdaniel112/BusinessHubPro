import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricData = {
  revenue: {
    value: number;
    change: number;
  };
  expenses: {
    value: number;
    change: number;
  };
  profit: {
    value: number;
    change: number;
  };
  inventory: {
    total: number;
    lowStock: number;
  };
};

interface KeyMetricsProps {
  data: MetricData;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const MetricCard = ({ 
  icon, 
  bgColor, 
  iconColor, 
  title, 
  value, 
  change, 
  footer,
  isLoading
}: { 
  icon: string; 
  bgColor: string; 
  iconColor: string; 
  title: string; 
  value: string | number; 
  change?: number; 
  footer?: React.ReactNode;
  isLoading?: boolean;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 rounded-md", bgColor)}>
            <i className={cn(`ri-${icon} text-xl`, iconColor)}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                {isLoading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {(change !== undefined || footer) && (
        <div className="bg-gray-50 px-5 py-3">
          {isLoading ? (
            <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : change !== undefined ? (
            <div className="text-sm">
              <span className={cn(
                "font-medium",
                change >= 0 ? "text-success-600" : "text-danger-600"
              )}>
                {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(0)}%
              </span>
              <span className="text-gray-500 ml-2">from last period</span>
            </div>
          ) : (
            footer
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function KeyMetrics({ data, isLoading = false }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon="money-dollar-circle-line"
        bgColor="bg-primary-50"
        iconColor="text-primary-600"
        title="Revenue"
        value={isLoading ? "" : formatCurrency(data.revenue.value)}
        change={data.revenue.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="shopping-bag-line"
        bgColor="bg-danger-50"
        iconColor="text-danger-600"
        title="Expenses"
        value={isLoading ? "" : formatCurrency(data.expenses.value)}
        change={data.expenses.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="line-chart-line"
        bgColor="bg-success-50"
        iconColor="text-success-600"
        title="Profit"
        value={isLoading ? "" : formatCurrency(data.profit.value)}
        change={data.profit.change}
        isLoading={isLoading}
      />
      
      <MetricCard
        icon="store-2-line"
        bgColor="bg-warning-50"
        iconColor="text-warning-600"
        title="Inventory Items"
        value={isLoading ? "" : data.inventory.total}
        footer={
          <div className="text-sm">
            <span className="font-medium text-warning-600">◆ {data.inventory.lowStock}</span>
            <span className="text-gray-500 ml-2">low stock items</span>
          </div>
        }
        isLoading={isLoading}
      />
    </div>
  );
}
